"""
Каталог объектов и расчёт их положений во времени (пропагация орбит).

Основной метод — SGP4 (библиотека `sgp4`): именно для него публикуются
элементы TLE/OMM, точность — порядка километра на сутки вперёд.
Если `sgp4` не установлена, используется упрощённая модель
Кеплер + J2 (только для тестов — для реальных данных ставь sgp4).

Все координаты — в инерциальной системе (TEME), км и км/с.
Для расстояний между объектами система координат не важна.
"""
from dataclasses import dataclass
from datetime import datetime, timezone

import numpy as np
import pandas as pd

MU = 398600.4418          # км^3/с^2
RE = 6378.137             # км
J2 = 1.08262668e-3

try:
    from sgp4.api import Satrec, SatrecArray
    from sgp4 import omm as _omm
    HAVE_SGP4 = True
except ImportError:  # pragma: no cover
    HAVE_SGP4 = False


def datetime_to_jd(dt: datetime) -> float:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.timestamp() / 86400.0 + 2440587.5


def jd_to_datetime(jd: float) -> datetime:
    return datetime.fromtimestamp((jd - 2440587.5) * 86400.0, tz=timezone.utc)


@dataclass
class Catalog:
    df: pd.DataFrame            # исходные строки (строки как str)
    norad: np.ndarray
    name: np.ndarray
    otype: np.ndarray
    epoch_jd: np.ndarray
    n_rad_s: np.ndarray         # среднее движение, рад/с
    ecc: np.ndarray
    inc: np.ndarray             # рад
    raan: np.ndarray
    argp: np.ndarray
    ma: np.ndarray
    a: np.ndarray               # большая полуось, км
    perigee_alt: np.ndarray     # км
    apogee_alt: np.ndarray

    def __len__(self):
        return len(self.norad)

    @classmethod
    def load(cls, path, min_perigee_km=120.0):
        df = pd.read_csv(path, dtype=str).reset_index(drop=True)
        f = lambda c: pd.to_numeric(df[c], errors="coerce").to_numpy(float)
        n_rev_day = f("MEAN_MOTION")
        ecc = f("ECCENTRICITY")
        a = (MU / (n_rev_day * 2 * np.pi / 86400.0) ** 2) ** (1 / 3)
        perigee = a * (1 - ecc) - RE
        good = np.isfinite(a) & (ecc < 0.99) & (perigee > min_perigee_km)
        df = df[good].reset_index(drop=True)
        epochs = pd.to_datetime(df["EPOCH"], utc=True, format="ISO8601")
        unix_s = (epochs - pd.Timestamp("1970-01-01", tz="UTC")).dt.total_seconds().to_numpy()
        epoch_jd = unix_s / 86400.0 + 2440587.5
        a, ecc = a[good], ecc[good]
        return cls(
            df=df,
            norad=pd.to_numeric(df["NORAD_CAT_ID"]).to_numpy(int),
            name=df["OBJECT_NAME"].to_numpy(str),
            otype=df["OBJECT_TYPE"].fillna("UNKNOWN").to_numpy(str),
            epoch_jd=epoch_jd,
            n_rad_s=n_rev_day[good] * 2 * np.pi / 86400.0,
            ecc=ecc,
            inc=np.radians(f("INCLINATION")[good]),
            raan=np.radians(f("RA_OF_ASC_NODE")[good]),
            argp=np.radians(f("ARG_OF_PERICENTER")[good]),
            ma=np.radians(f("MEAN_ANOMALY")[good]),
            a=a,
            perigee_alt=a * (1 - ecc) - RE,
            apogee_alt=a * (1 + ecc) - RE,
        )

    def subset(self, mask) -> "Catalog":
        mask = np.asarray(mask)
        kw = {k: (v[mask] if isinstance(v, np.ndarray) else v) for k, v in self.__dict__.items()}
        kw["df"] = self.df[mask].reset_index(drop=True)
        return Catalog(**kw)

    def index_of(self, key) -> int:
        """Найти объект по номеру NORAD или по названию (без учёта регистра)."""
        s = str(key).strip()
        if s.isdigit():
            hits = np.flatnonzero(self.norad == int(s))
        else:
            up = np.char.upper(self.name.astype(str))
            hits = np.flatnonzero(up == s.upper())
            if len(hits) == 0:
                hits = np.flatnonzero(np.char.find(up, s.upper()) >= 0)
        if len(hits) == 0:
            raise KeyError(f"Объект '{key}' не найден в каталоге")
        return int(hits[0])


class Propagator:
    """propagate(idx, jd) -> r (N,T,3), v (N,T,3), ok (N,T)"""

    def __init__(self, cat: Catalog, backend: str = "auto"):
        self.cat = cat
        if backend == "auto":
            backend = "sgp4" if HAVE_SGP4 else "kepler_j2"
        if backend == "sgp4" and not HAVE_SGP4:
            raise ImportError("Библиотека sgp4 не установлена: pip install sgp4")
        self.backend = backend
        if backend == "sgp4":
            sats, good = [], np.zeros(len(cat), bool)
            for k, row in enumerate(cat.df.fillna("").to_dict("records")):
                try:
                    sat = Satrec()
                    _omm.initialize(sat, row)
                    sats.append(sat)
                    good[k] = True
                except Exception:
                    pass
            if not good.all():
                print(f"  пропущено {int((~good).sum())} объектов с битыми элементами")
                cat = cat.subset(good)
            self.cat = cat
            self._sats = sats
        else:
            print("ВНИМАНИЕ: sgp4 не найдена, используется упрощённая модель Кеплер+J2 "
                  "(подходит только для тестов). Установи: pip install sgp4")
            c = cat
            p = c.a * (1 - c.ecc**2)
            k = 1.5 * J2 * (RE / p) ** 2 * c.n_rad_s
            s2 = np.sin(c.inc) ** 2
            self._raan_dot = -k * np.cos(c.inc)
            self._argp_dot = k * (2 - 2.5 * s2)
            self._ma_dot = c.n_rad_s + k * np.sqrt(1 - c.ecc**2) * (1 - 1.5 * s2)

    def propagate(self, idx, jd):
        idx = np.asarray(idx, dtype=int)
        jd = np.atleast_1d(np.asarray(jd, dtype=float))
        if self.backend == "sgp4":
            arr = SatrecArray([self._sats[i] for i in idx])
            jd_i = np.floor(jd)
            err, r, v = arr.sgp4(jd_i, jd - jd_i)
            ok = (err == 0) & np.isfinite(r[..., 0])
            return r, v, ok
        return self._kepler_j2(idx, jd)

    def _kepler_j2(self, idx, jd):
        c = self.cat
        dt = (jd[None, :] - c.epoch_jd[idx, None]) * 86400.0          # (N,T) секунды
        e = c.ecc[idx, None]
        M = c.ma[idx, None] + self._ma_dot[idx, None] * dt
        w = c.argp[idx, None] + self._argp_dot[idx, None] * dt
        O = c.raan[idx, None] + self._raan_dot[idx, None] * dt
        i = c.inc[idx, None]
        E = M.copy()
        for _ in range(8):                                           # уравнение Кеплера
            E = E - (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
        nu = 2 * np.arctan2(np.sqrt(1 + e) * np.sin(E / 2), np.sqrt(1 - e) * np.cos(E / 2))
        a = c.a[idx, None]
        p = a * (1 - e**2)
        rr = p / (1 + e * np.cos(nu))
        xp, yp = rr * np.cos(nu), rr * np.sin(nu)
        vf = np.sqrt(MU / p)
        vxp, vyp = -vf * np.sin(nu), vf * (e + np.cos(nu))
        cO, sO, cw, sw, ci, si = np.cos(O), np.sin(O), np.cos(w), np.sin(w), np.cos(i), np.sin(i)
        R11, R12 = cO * cw - sO * sw * ci, -cO * sw - sO * cw * ci
        R21, R22 = sO * cw + cO * sw * ci, -sO * sw + cO * cw * ci
        R31, R32 = sw * si, cw * si
        r = np.stack([R11 * xp + R12 * yp, R21 * xp + R22 * yp, R31 * xp + R32 * yp], axis=-1)
        v = np.stack([R11 * vxp + R12 * vyp, R21 * vxp + R22 * vyp, R31 * vxp + R32 * vyp], axis=-1)
        ok = np.isfinite(r[..., 0])
        return r, v, ok
