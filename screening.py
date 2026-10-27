"""
Поиск сближений (conjunction screening) и оценка вероятности столкновения.

Алгоритм:
1. Отбрасываем объекты, чьи высоты (перигей..апогей) не пересекаются с
   высотами выбранных спутников — они физически не могут сблизиться.
2. Идём по времени с шагом STEP. На каждом шаге строим KD-дерево положений
   и находим пары ближе «грубого» радиуса = R + Vmax*STEP/2
   (так мы не пропустим быстрое сближение между шагами).
3. Для каждой пары считаем момент наибольшего сближения (TCA) в линейном
   приближении относительного движения — на интервале ±STEP/2 оно очень точное.
4. Вероятность столкновения Pc (d — промах, R — сумма радиусов объектов):
   * PC_METHOD = "max"   (по умолчанию) — максимально возможная Pc при
     неизвестной ошибке положения: Pc_max = R² / (e·d²). Так же считает
     сервис SOCRATES на CelesTrak: у TLE нет ковариаций, поэтому берут
     худший случай.
   * PC_METHOD = "sigma" — изотропная гауссова ошибка σ, растущая с возрастом
     TLE: Pc = R²/(2σ²) · exp(-d²/(2σ²)).
"""
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

import config
from propagator import Propagator, jd_to_datetime


def altitude_overlap_mask(cat, targets, margin_km):
    """Какие объекты пересекаются по высоте хотя бы с одним из спутников targets."""
    targets = np.asarray(targets, dtype=int)
    if len(targets) == 0:
        return np.zeros(len(cat), bool)
    per_t = cat.perigee_alt[targets] - margin_km
    apo_t = cat.apogee_alt[targets] + margin_km
    # объединяем интервалы целей, чтобы проверка была быстрой
    order = np.argsort(per_t)
    lo, hi = [], []
    for p, a in zip(per_t[order], apo_t[order]):
        if lo and p <= hi[-1]:
            hi[-1] = max(hi[-1], a)
        else:
            lo.append(p); hi.append(a)
    lo, hi = np.array(lo), np.array(hi)
    # интервалы не пересекаются и отсортированы, поэтому достаточно проверить
    # последний интервал, начинающийся не выше апогея объекта
    k = np.searchsorted(lo, cat.apogee_alt, side="right") - 1
    mask = (k >= 0) & (hi[np.clip(k, 0, None)] >= cat.perigee_alt)
    mask[targets] = True
    return mask


def max_collision_probability(miss_km, hbr_km):
    """Максимальная Pc по всем возможным σ (Alfano / CelesTrak SOCRATES)."""
    d = np.maximum(miss_km, hbr_km)
    return np.clip(hbr_km**2 / (np.e * d**2), 0.0, 1.0)


def collision_probability(miss_km, sigma_km, hbr_km):
    """Pc для изотропной 2D-гауссовой ошибки (приближение R << σ)."""
    s2 = sigma_km**2
    pc = hbr_km**2 / (2 * s2) * np.exp(-miss_km**2 / (2 * s2))
    return np.clip(pc, 0.0, 1.0)


def object_sigma(otype, days_from_epoch):
    base = np.array([config.SIGMA_KM.get(t, config.SIGMA_KM["UNKNOWN"])[0] for t in otype])
    grow = np.array([config.SIGMA_KM.get(t, config.SIGMA_KM["UNKNOWN"])[1] for t in otype])
    return base + grow * np.abs(days_from_epoch)


def object_hbr_km(otype):
    return np.array([config.HARD_BODY_RADIUS_M.get(t, config.HARD_BODY_RADIUS_M["UNKNOWN"])
                     for t in otype]) / 1000.0


def constellation_of(names, otypes):
    """Группировка каждого объекта ('' — не входит ни в одну; мусор и ступени — никогда)."""
    first = pd.Series(np.asarray(names, dtype=str)).str.upper().str.extract(r"^([A-Z0-9]+)")[0]
    grp = first.where(first.isin(config.CONSTELLATION_PREFIXES), "").to_numpy(str)
    return np.where(np.asarray(otypes, dtype=str) == "PAYLOAD", grp, "")


def same_group(names_a, otypes_a, names_b, otypes_b):
    """True, если оба объекта из одной группировки."""
    ga, gb = constellation_of(names_a, otypes_a), constellation_of(names_b, otypes_b)
    return (ga != "") & (ga == gb)


def is_docked(miss_km, vrel_kms):
    """Промах и относительная скорость почти нулевые — объекты состыкованы."""
    return (np.asarray(miss_km, float) < config.DOCKED_MISS_KM) & (np.asarray(vrel_kms, float) < config.DOCKED_VREL_KMS)


def pc_to_class(pc):
    return np.digitize(pc, config.PC_THRESHOLDS)   # 0 SAFE, 1 LOW, 2 MEDIUM, 3 HIGH


def screen(prop: Propagator, targets, t0_jd, hours=None, step_s=None, radius_km=None,
           chunk_steps=180, verbose=True) -> pd.DataFrame:
    """Найти все сближения спутников targets со всеми объектами каталога.

    Возвращает таблицу событий: target, other (индексы в каталоге), время TCA,
    промах (км), относительная скорость (км/с), Pc.
    """
    hours = hours or config.SCREEN_HOURS
    step_s = step_s or config.SCREEN_STEP_S
    radius_km = radius_km or config.SCREEN_RADIUS_KM
    cat = prop.cat
    targets = np.unique(np.asarray(targets, dtype=int))

    # 1. отбор по высоте (+ запас на ошибки пропагации)
    cand = np.flatnonzero(altitude_overlap_mask(cat, targets, radius_km + 10.0))
    t_local = np.searchsorted(cand, targets)                       # позиции целей внутри cand
    coarse = radius_km + 0.5 * config.MAX_REL_SPEED_KMS * step_s
    n_steps = int(hours * 3600 / step_s) + 1
    t_sec = np.arange(n_steps) * step_s
    if verbose:
        print(f"  скрининг: {len(targets)} спутников против {len(cand)} объектов, "
              f"{hours} ч, шаг {step_s:g} с ({n_steps} шагов)")

    out = {k: [] for k in ("ti", "oj", "tca", "miss", "vrel")}
    for c0 in range(0, n_steps, chunk_steps):
        ts = t_sec[c0:c0 + chunk_steps]
        r, v, ok = prop.propagate(cand, t0_jd + ts / 86400.0)
        for s in range(len(ts)):
            P, V, good = r[:, s], v[:, s], ok[:, s]
            g_all = np.flatnonzero(good)
            g_t = t_local[good[t_local]]
            if len(g_t) == 0 or len(g_all) < 2:
                continue
            tree_all = cKDTree(P[g_all])
            tree_t = cKDTree(P[g_t])
            pairs = tree_t.sparse_distance_matrix(tree_all, coarse, output_type="ndarray")
            if len(pairs) == 0:
                continue
            i = g_t[pairs["i"]]
            j = g_all[pairs["j"]]
            keep = i != j
            i, j = i[keep], j[keep]
            dr = P[j] - P[i]
            dv = V[j] - V[i]
            vv = np.einsum("ij,ij->i", dv, dv)
            tstar = -np.einsum("ij,ij->i", dr, dv) / np.maximum(vv, 1e-12)
            tstar = np.clip(tstar, -step_s / 2, step_s / 2)
            miss = np.linalg.norm(dr + dv * tstar[:, None], axis=1)
            hit = miss < radius_km
            if hit.any():
                out["ti"].append(cand[i[hit]])
                out["oj"].append(cand[j[hit]])
                out["tca"].append(ts[s] + tstar[hit])
                out["miss"].append(miss[hit])
                out["vrel"].append(np.sqrt(vv[hit]))
        if verbose:
            done = min(c0 + chunk_steps, n_steps)
            print(f"\r  прогресс: {100 * done / n_steps:5.1f}%", end="", flush=True)
    if verbose:
        print()

    cols = ["target", "other", "tca_s", "miss_km", "vrel_kms"]
    if not out["ti"]:
        return pd.DataFrame(columns=cols + ["sigma_km", "pc_max", "pc_sigma", "pc", "tca_utc", "target_norad",
                                            "target_name", "other_norad", "other_name", "other_type",
                                            "same_group", "docked", "intra_pair"])
    ev = pd.DataFrame({
        "target": np.concatenate(out["ti"]), "other": np.concatenate(out["oj"]),
        "tca_s": np.concatenate(out["tca"]), "miss_km": np.concatenate(out["miss"]),
        "vrel_kms": np.concatenate(out["vrel"]),
    })
    # 3. одно событие = серия соседних шагов одной пары; оставляем минимум промаха
    ev = ev.sort_values(["target", "other", "tca_s"]).reset_index(drop=True)
    new_event = (ev["target"].diff() != 0) | (ev["other"].diff() != 0) | (ev["tca_s"].diff() > config.EVENT_GAP_S)
    ev["event_id"] = new_event.cumsum()
    ev = ev.loc[ev.groupby("event_id")["miss_km"].idxmin()].drop(columns="event_id").reset_index(drop=True)

    # 4. вероятность столкновения
    tca_jd = t0_jd + ev["tca_s"].to_numpy() / 86400.0
    ti, oj = ev["target"].to_numpy(), ev["other"].to_numpy()
    sig_t = object_sigma(cat.otype[ti], tca_jd - cat.epoch_jd[ti])
    sig_o = object_sigma(cat.otype[oj], tca_jd - cat.epoch_jd[oj])
    sigma = np.sqrt(sig_t**2 + sig_o**2)
    hbr = object_hbr_km(cat.otype[ti]) + object_hbr_km(cat.otype[oj])
    ev["sigma_km"] = sigma
    miss = ev["miss_km"].to_numpy()
    ev["pc_max"] = max_collision_probability(miss, hbr)
    ev["pc_sigma"] = collision_probability(miss, sigma, hbr)
    ev["pc"] = ev["pc_max"] if config.PC_METHOD == "max" else ev["pc_sigma"]
    ev["tca_utc"] = [jd_to_datetime(j).strftime("%Y-%m-%dT%H:%M:%SZ") for j in tca_jd]
    ev["target_norad"] = cat.norad[ti]
    ev["target_name"] = cat.name[ti]
    ev["other_norad"] = cat.norad[oj]
    ev["other_name"] = cat.name[oj]
    ev["other_type"] = cat.otype[oj]
    ev["same_group"] = same_group(cat.name[ti], cat.otype[ti], cat.name[oj], cat.otype[oj])
    ev["docked"] = is_docked(ev["miss_km"], ev["vrel_kms"])
    ev["intra_pair"] = ev["same_group"] | ev["docked"]
    return ev.sort_values("pc", ascending=False).reset_index(drop=True)


def risk_per_target(events: pd.DataFrame, targets, intra_group=None):
    """Максимальная Pc и класс риска для каждого спутника (нет сближений -> SAFE).

    intra_group=False — не учитывать внутренние пары: одна группировка или
    состыкованные объекты (по умолчанию config.LABEL_INTRA_GROUP).
    """
    targets = np.asarray(targets)
    if intra_group is None:
        intra_group = config.LABEL_INTRA_GROUP
    if not intra_group and len(events):
        events = events[~events["intra_pair"].astype(bool)]
    max_pc = pd.Series(0.0, index=targets)
    n_conj = pd.Series(0, index=targets)
    min_miss = pd.Series(np.nan, index=targets)
    if len(events):
        g = events.groupby("target")
        max_pc.update(g["pc"].max())
        n_conj.update(g.size())
        min_miss.update(g["miss_km"].min())
    return pd.DataFrame({"max_pc": max_pc.values, "n_conj": n_conj.values,
                         "min_miss_km": min_miss.values,
                         "risk_class": pc_to_class(max_pc.values)}, index=targets)
