"""
«Дешёвые» признаки спутника для MLP.

Идея: полный поиск сближений на 2 суток вперёд требует просчитать
миллионы положений. Модель же должна оценить риск мгновенно — по тому,
что известно в момент t0: где спутник летает и насколько там «тесно».

Признаки:
  орбита:      высота перигея/апогея, наклонение, эксцентриситет, среднее движение
  свежесть:    возраст орбитальных элементов (старые элементы = больше ошибка)
  окружение:   сколько объектов (всех / мусора / ступеней / спутников) летает
               в том же слое высот ±10/25/50 км, доля мусора,
               средняя и максимальная оценка скорости встречных объектов
               (по углу между плоскостями орбит)
  группировка: входит ли спутник в группировку и сколько «своих» в его слое
  фазировка:   для объектов с малым MOID — когда оба окажутся у линии пересечения
               орбит за окно прогноза и какой промах из этого следует
  снимок t0:   расстояние до ближайшего объекта и число соседей в 50/200 км
"""
import warnings

import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

import config
from propagator import MU, RE, Propagator
from screening import constellation_of, object_hbr_km

FEATURE_NAMES = None  # заполняется при первом вызове compute_features
MOID_LIMITS_KM = [1, 5, 20]
CONSTELLATION_FEATURES = ["in_constellation", "log_n_same_group_shell_25", "frac_same_group_shell_25"]


def _orbit_axes(cat):
    """Единичные векторы: P — на перигей, W — нормаль к плоскости, Q = W x P."""
    cO, sO = np.cos(cat.raan), np.sin(cat.raan)
    cw, sw = np.cos(cat.argp), np.sin(cat.argp)
    ci, si = np.cos(cat.inc), np.sin(cat.inc)
    P = np.stack([cO * cw - sO * sw * ci, sO * cw + cO * sw * ci, sw * si], axis=-1)
    W = np.stack([sO * si, -cO * si, ci], axis=-1)
    return P, np.cross(W, P), W


def _moid_estimate(tg, P, Q, W, p, e, a):
    """Приближённый MOID (км) между орбитами целей tg и всеми объектами.

    Две орбиты «пересекаются» на линии пересечения их плоскостей. В двух
    точках этой линии (±k) берём радиус каждой орбиты и разность радиусов.
    Для почти круговых орбит НОО это хорошее приближение MOID.
    """
    k = np.cross(W[tg, None, :], W[None, :, :])                    # (T,N,3)
    kn = np.linalg.norm(k, axis=-1, keepdims=True)
    coplanar = kn[..., 0] < 1e-6
    k = k / np.maximum(kn, 1e-12)

    def radius(Pa, Qa, pp, ee, sign):
        # истинная аномалия точки орбиты в направлении sign*k
        nu = np.arctan2(sign * (k * Qa).sum(-1), sign * (k * Pa).sum(-1))
        return pp / (1 + ee * np.cos(nu))

    best = np.full(k.shape[:2], np.inf)
    for sgn in (1.0, -1.0):
        r_t = radius(P[tg, None, :], Q[tg, None, :], p[tg, None], e[tg, None], sgn)
        r_o = radius(P[None, :, :], Q[None, :, :], p[None, :], e[None, :], sgn)
        best = np.minimum(best, np.abs(r_t - r_o))
    # почти в одной плоскости: берём разницу больших полуосей
    best = np.where(coplanar, np.abs(a[tg, None] - a[None, :]), best)
    best[np.arange(len(tg)), tg] = np.inf
    return best


def _shell_count(per_o, apo_o, per_t, apo_t, margin):
    """Число объектов, чей интервал высот пересекает [per_t - m, apo_t + m]."""
    ps, as_ = np.sort(per_o), np.sort(apo_o)
    return (np.searchsorted(ps, apo_t + margin, side="right")
            - np.searchsorted(as_, per_t - margin, side="left"))


def constellation_features(cat, targets) -> dict:
    """Признаки группировки: модель сможет отличить «тесно от своих» от «тесно от чужих»."""
    targets = np.asarray(targets, dtype=int)
    per, apo = cat.perigee_alt, cat.apogee_alt
    grp = constellation_of(cat.name, cat.otype)
    gt = grp[targets]
    n_same = np.zeros(len(targets))
    for g in np.unique(gt[gt != ""]):
        sel, mine = grp == g, gt == g
        n_same[mine] = _shell_count(per[sel], apo[sel], per[targets[mine]], apo[targets[mine]], 25) - 1
    n_all = _shell_count(per, apo, per[targets], apo[targets], 25) - 1
    return {
        "in_constellation": (gt != "").astype(float),
        "log_n_same_group_shell_25": np.log1p(np.maximum(n_same, 0)),
        "frac_same_group_shell_25": np.maximum(n_same, 0) / np.maximum(n_all, 1),
    }


def _unit(x):
    return x / np.maximum(np.linalg.norm(x, axis=-1, keepdims=True), 1e-12)


def phasing_features(prop: Propagator, targets, t0_jd, pt, po, pmoid, hours=None) -> dict:
    """Признаки фазировки: MOID говорит, что орбиты пересекаются, а фазировка — встретятся ли объекты.

    pt — позиция цели в targets, po — индекс объекта в каталоге, pmoid — MOID пары (км).
    Раз в PHASE_ANCHOR_S берём точные положения (SGP4). Для каждой пары находим линию
    пересечения плоскостей k и время, через которое каждый объект пройдёт направление ±k
    (угловую скорость берём по двум соседним точкам). Если цель проходит узел в момент t1,
    а объект — в t2, то при прямолинейном движении у узла минимальное расстояние вдоль
    траекторий = |t1 - t2| · |v1 × v2| / |v1 - v2|; к нему добавляем MOID по радиусу.
    """
    cat = prop.cat
    targets = np.asarray(targets, dtype=int)
    hours = hours or config.SCREEN_HOURS
    A = config.PHASE_ANCHOR_S
    n_anchor = int(np.ceil(hours * 3600 / A))
    min_d = np.full(len(targets), np.inf)
    pc_max, pc_sum, n_close = (np.zeros(len(targets)) for _ in range(3))

    if len(pt):
        objs, inv = np.unique(np.concatenate([targets[pt], po]), return_inverse=True)
        it, io = inv[:len(pt)], inv[len(pt):]
        r, v, ok = prop.propagate(objs, t0_jd + np.arange(n_anchor + 1) * A / 86400.0)
        h = _unit(np.cross(r, v))
        e1 = _unit(r)
        e2 = np.cross(h, e1)                                   # направление движения
        speed = np.linalg.norm(v, axis=-1)
        # угол, пройденный за A секунд, в плоскости орбиты на начало интервала
        swept = np.mod(np.arctan2((e1[:, 1:] * e2[:, :-1]).sum(-1), (e1[:, 1:] * e1[:, :-1]).sum(-1)), 2 * np.pi)
        n_mean = cat.n_rad_s[objs, None]
        rate = (swept + 2 * np.pi * np.round((n_mean * A - swept) / (2 * np.pi))) / A
        rate = np.where(rate > 0, rate, n_mean)
        period = 2 * np.pi / rate
        hbr = object_hbr_km(cat.otype[targets[pt]]) + object_hbr_km(cat.otype[po])

        for k in range(n_anchor):
            valid = ok[it, k] & ok[io, k] & ok[it, k + 1] & ok[io, k + 1]
            node = np.cross(h[it, k], h[io, k])
            kn = np.linalg.norm(node, axis=-1)
            valid &= kn > 1e-6                                  # одна плоскость: узла нет
            node = node / np.maximum(kn, 1e-12)[:, None]
            for sign in (1.0, -1.0):
                kk = sign * node
                phi_t = np.mod(np.arctan2((kk * e2[it, k]).sum(-1), (kk * e1[it, k]).sum(-1)), 2 * np.pi)
                tau_t = phi_t / rate[it, k]                     # цель у узла через tau_t секунд
                use = valid & (tau_t < A)
                if not use.any():
                    continue
                phi_o = np.mod(np.arctan2((kk * e2[io, k]).sum(-1), (kk * e1[io, k]).sum(-1)), 2 * np.pi)
                tau_o = phi_o / rate[io, k]
                P_o = period[io, k]
                dt = tau_t - (tau_o + np.round((tau_t - tau_o) / P_o) * P_o)   # ближайший проход объекта
                v1 = np.cross(h[it, k], kk) * speed[it, k, None]
                v2 = np.cross(h[io, k], kk) * speed[io, k, None]
                along = np.abs(dt) * np.linalg.norm(np.cross(v1, v2), axis=-1) / np.maximum(
                    np.linalg.norm(v1 - v2, axis=-1), 1e-9)
                d = np.sqrt(pmoid**2 + along**2)[use]
                p = pt[use]
                np.minimum.at(min_d, p, d)
                pc = hbr[use] ** 2 / (np.e * np.maximum(d, hbr[use]) ** 2)
                np.maximum.at(pc_max, p, pc)
                np.add.at(pc_sum, p, pc)
                np.add.at(n_close, p, (d < config.SCREEN_RADIUS_KM).astype(float))

    return {
        "log_phase_min_miss_km": np.log10(np.clip(min_d, 1e-3, 1e3)),
        "log_phase_pc_max": np.log10(pc_max + 1e-12),
        "log_phase_pc_sum": np.log10(pc_sum + 1e-12),
        "log_n_phase_close": np.log1p(n_close),
    }


def compute_features(prop: Propagator, targets, t0_jd, chunk=100) -> pd.DataFrame:
    cat = prop.cat
    targets = np.asarray(targets, dtype=int)
    per, apo = cat.perigee_alt, cat.apogee_alt
    pt, at = per[targets], apo[targets]
    f = {}

    # --- орбита
    f["perigee_alt_km"] = pt
    f["apogee_alt_km"] = at
    f["inclination_deg"] = np.degrees(cat.inc[targets])
    f["eccentricity"] = cat.ecc[targets]
    f["mean_motion_rev_day"] = cat.n_rad_s[targets] * 86400 / (2 * np.pi)
    f["tle_age_days"] = np.abs(t0_jd - cat.epoch_jd[targets])

    # --- плотность в слое высот (минус сам спутник)
    for m in config.SHELL_MARGINS_KM:
        f[f"log_n_shell_{m}"] = np.log1p(_shell_count(per, apo, pt, at, m) - 1)
    m = 25
    for t, key in (("DEBRIS", "debris"), ("ROCKET BODY", "rb"), ("PAYLOAD", "payload")):
        sel = cat.otype == t
        cnt = _shell_count(per[sel], apo[sel], pt, at, m)
        if t == "PAYLOAD":
            cnt = cnt - 1
        f[f"log_n_{key}_shell_{m}"] = np.log1p(np.maximum(cnt, 0))
    n_all = np.expm1(f["log_n_shell_25"])
    f["frac_debris_shell_25"] = np.expm1(f["log_n_debris_shell_25"]) / np.maximum(n_all, 1)

    # --- оценка скорости встречных объектов в слое ±25 км
    v_circ = np.sqrt(MU / (RE + (pt + at) / 2))
    mean_v, max_v, frac_fast = (np.zeros(len(targets)) for _ in range(3))
    moid_cnt = {k: np.zeros(len(targets)) for k in MOID_LIMITS_KM}
    flux, pc_pot_max, pc_pot_sum = (np.zeros(len(targets)) for _ in range(3))
    ci, si = np.cos(cat.inc), np.sin(cat.inc)
    Pv, Qv, Wv = _orbit_axes(cat)                           # ориентация орбит (N,3)
    p_semi = cat.a * (1 - cat.ecc**2)
    hbr = object_hbr_km(cat.otype)
    grp = constellation_of(cat.name, cat.otype)
    pairs_t, pairs_o, pairs_moid = [], [], []
    for s in range(0, len(targets), chunk):
        tg = targets[s:s + chunk]
        in_shell = (per[None, :] <= apo[tg, None] + m) & (apo[None, :] >= per[tg, None] - m)
        in_shell[np.arange(len(tg)), tg] = False
        cos_th = (ci[tg, None] * ci[None, :]
                  + si[tg, None] * si[None, :] * np.cos(cat.raan[tg, None] - cat.raan[None, :]))
        vrel = 2 * v_circ[s:s + chunk, None] * np.sqrt(np.clip((1 - cos_th) / 2, 0, 1))  # 2v·sin(θ/2)
        cnt = in_shell.sum(axis=1)
        vr_masked = np.where(in_shell, vrel, np.nan)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)
            mean_v[s:s + chunk] = np.where(cnt > 0, np.nanmean(vr_masked, axis=1), 0)
            max_v[s:s + chunk] = np.where(cnt > 0, np.nanmax(vr_masked, axis=1), 0)
        frac_fast[s:s + chunk] = np.where(cnt > 0, (in_shell & (vrel > 5)).sum(axis=1) / np.maximum(cnt, 1), 0)

        # MOID — минимальное расстояние между самими орбитами (без учёта времени).
        # Близкое сближение возможно только если MOID мал; когда именно — дело случая.
        moid = _moid_estimate(tg, Pv, Qv, Wv, p_semi, cat.ecc, cat.a)
        moid = np.where(in_shell, moid, np.inf)
        for k in MOID_LIMITS_KM:
            moid_cnt[k][s:s + chunk] = (moid < k).sum(axis=1)
        close = moid < 5.0
        flux[s:s + chunk] = np.where(close, vrel, 0).sum(axis=1)
        R = hbr[tg, None] + hbr[None, :]
        pot = R**2 / (np.e * np.maximum(moid, R) ** 2)          # «потенциал» Pc_max при d = MOID
        pot = np.where(np.isfinite(moid), pot, 0)
        pc_pot_max[s:s + chunk] = pot.max(axis=1)
        pc_pot_sum[s:s + chunk] = pot.sum(axis=1)

        # кандидаты для фазировки: малый MOID и не своя группировка (как в метках)
        same = (grp[tg, None] != "") & (grp[tg, None] == grp[None, :])
        ii, jj = np.nonzero((moid < config.PHASE_MOID_KM) & ~same)
        pairs_t.append(s + ii)
        pairs_o.append(jj)
        pairs_moid.append(moid[ii, jj])
    f["mean_vrel_est_kms"] = np.nan_to_num(mean_v)
    f["max_vrel_est_kms"] = np.nan_to_num(max_v)
    f["frac_fast_crossers"] = frac_fast
    for k in MOID_LIMITS_KM:
        f[f"log_n_moid_{k:g}km"] = np.log1p(moid_cnt[k])
    f["log_flux_moid5"] = np.log1p(flux)
    f["log_pc_potential_max"] = np.log10(pc_pot_max + 1e-12)
    f["log_pc_potential_sum"] = np.log10(pc_pot_sum + 1e-12)

    # --- группировка
    f.update(constellation_features(cat, targets))

    # --- фазировка
    f.update(phasing_features(prop, targets, t0_jd, np.concatenate(pairs_t), np.concatenate(pairs_o),
                              np.concatenate(pairs_moid)))

    # --- снимок в момент t0
    r, _, ok = prop.propagate(np.arange(len(cat)), [t0_jd])
    P = r[:, 0]
    good = ok[:, 0]
    tree = cKDTree(P[good])
    gidx = np.flatnonzero(good)
    # спутники, которые не удалось пропагировать в t0 (сошли с орбиты), получают NaN
    tg_ok = good[targets]
    tq = targets[tg_ok]
    d, j = tree.query(P[tq], k=2)                           # [0] — сам спутник
    nearest = np.full(len(targets), np.nan)
    nearest[tg_ok] = np.where(gidx[j[:, 0]] == tq, d[:, 1], d[:, 0])
    f["log_nearest_km_t0"] = np.log10(np.maximum(nearest, 1e-3))
    for rad in config.SNAPSHOT_RADII_KM:
        cnt = np.full(len(targets), np.nan)
        cnt[tg_ok] = tree.query_ball_point(P[tq], r=rad, return_length=True) - 1
        f[f"log_n_within_{rad}km_t0"] = np.log1p(np.maximum(cnt, 0))

    df = pd.DataFrame(f, index=targets)
    global FEATURE_NAMES
    FEATURE_NAMES = list(df.columns)
    return df
