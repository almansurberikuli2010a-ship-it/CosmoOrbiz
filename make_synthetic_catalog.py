"""
Синтетический каталог для офлайн-проверки (когда нет интернета).

Создаёт data/catalog.csv в том же формате, что и data_download.py:
созвездия спутников, солнечно-синхронные спутники, ступени ракет,
облака мусора на 780–850 км (похожие на реальные Cosmos-2251 / Fengyun-1C).

Для настоящей модели используй реальные данные: python data_download.py
"""
import argparse
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd

import config

MU = 398600.4418
RE = 6378.137


def sso_inclination(a_km, e=0.0):
    """Наклонение солнечно-синхронной орбиты для большой полуоси a."""
    J2 = 1.08263e-3
    n = np.sqrt(MU / a_km**3)
    rate = 2 * np.pi / (365.2422 * 86400)
    cos_i = -rate / (1.5 * n * J2 * (RE / a_km) ** 2 / (1 - e**2) ** 2)
    return np.degrees(np.arccos(np.clip(cos_i, -1, 1)))


def make_rows(rng, n, kind, name, perigee, apogee, inc, raan=None, ma=None, bstar=1e-4):
    perigee = np.broadcast_to(perigee, n).astype(float)
    apogee = np.maximum(np.broadcast_to(apogee, n).astype(float), perigee)
    a = RE + (perigee + apogee) / 2
    e = (apogee - perigee) / (2 * a)
    mm = np.sqrt(MU / a**3) * 86400 / (2 * np.pi)
    return pd.DataFrame({
        "OBJECT_NAME": [f"{name} {i + 1}" for i in range(n)],
        "OBJECT_TYPE": kind,
        "MEAN_MOTION": mm,
        "ECCENTRICITY": e,
        "INCLINATION": np.broadcast_to(inc, n).astype(float),
        "RA_OF_ASC_NODE": rng.uniform(0, 360, n) if raan is None else np.broadcast_to(raan, n) % 360,
        "ARG_OF_PERICENTER": rng.uniform(0, 360, n),
        "MEAN_ANOMALY": rng.uniform(0, 360, n) if ma is None else np.broadcast_to(ma, n) % 360,
        "BSTAR": bstar,
    })


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--scale", type=float, default=1.0, help="множитель числа объектов")
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)
    s = lambda k: max(1, int(k * args.scale))
    parts = []

    # Созвездие A: 24 плоскости x 40 спутников, 53°. Как у настоящих созвездий,
    # плоскости разнесены по высоте (530–590 км), чтобы спутники не сталкивались друг с другом
    planes, per = s(24), 40
    raan = np.repeat(np.arange(planes) * 360 / planes, per)
    ma = np.tile(np.arange(per) * 360 / per, planes) + np.repeat(np.arange(planes) * 360 / per / 3, per)
    h = np.repeat(530 + 2.5 * np.arange(planes), per) + rng.normal(0, 0.05, planes * per)
    parts.append(make_rows(rng, planes * per, "PAYLOAD", "STARNET", h, h + 0.3,
                           53.0 + rng.normal(0, 0.01, planes * per), raan, ma))
    # Созвездие B: 6 плоскостей x 11, 780 км, 86.4°
    raan = np.repeat(np.arange(6) * 30.0, 11)
    ma = np.tile(np.arange(11) * 360 / 11, 6)
    parts.append(make_rows(rng, 66, "PAYLOAD", "POLARLINK", 780, 781, 86.4, raan, ma))
    # Солнечно-синхронные спутники
    n = s(600); h = rng.uniform(450, 800, n)
    parts.append(make_rows(rng, n, "PAYLOAD", "EO-SAT", h, h + rng.uniform(0, 15, n), sso_inclination(RE + h)))
    # Прочие НОО спутники
    n = s(400); h = rng.uniform(300, 1400, n)
    parts.append(make_rows(rng, n, "PAYLOAD", "LEOSAT", h, h + rng.uniform(0, 60, n), rng.uniform(0, 100, n)))
    # ГСО и СОО
    n = s(150)
    parts.append(make_rows(rng, n, "PAYLOAD", "GEOSAT", 35780, 35792, rng.uniform(0, 0.1, n), bstar=0.0))
    n = s(60)
    parts.append(make_rows(rng, n, "PAYLOAD", "NAVSAT", 20180, 20220, 55.0, bstar=0.0))
    # Ступени ракет
    n = s(500); p = rng.uniform(300, 1500, n)
    parts.append(make_rows(rng, n, "ROCKET BODY", "CZ R/B", p, p + rng.exponential(300, n),
                           rng.choice([28.5, 51.6, 65.0, 71.0, 82.5, 98.0], n) + rng.normal(0, 0.3, n), bstar=3e-4))
    # Облака мусора
    n = s(1500); p = 850 + rng.normal(-60, 70, n)
    parts.append(make_rows(rng, n, "DEBRIS", "COSMOS 2251 DEB", p, p + rng.exponential(80, n),
                           74.0 + rng.normal(0, 0.8, n), bstar=4e-4))
    n = s(2000); p = 845 + rng.normal(-50, 80, n)
    parts.append(make_rows(rng, n, "DEBRIS", "FENGYUN 1C DEB", p, p + rng.exponential(100, n),
                           98.8 + rng.normal(0, 0.6, n), bstar=4e-4))
    n = s(500); p = 790 + rng.normal(-30, 50, n)
    parts.append(make_rows(rng, n, "DEBRIS", "IRIDIUM 33 DEB", p, p + rng.exponential(60, n),
                           86.4 + rng.normal(0, 0.5, n), bstar=4e-4))
    n = s(800); p = rng.uniform(350, 1500, n)
    parts.append(make_rows(rng, n, "DEBRIS", "UNKNOWN DEB", p, p + rng.exponential(150, n),
                           rng.uniform(0, 110, n), bstar=5e-4))

    cat = pd.concat(parts, ignore_index=True)
    n = len(cat)
    now = datetime.now(timezone.utc)
    epochs = [now - timedelta(days=float(d)) for d in rng.uniform(0.05, 2.0, n)]
    cat["EPOCH"] = [e.strftime("%Y-%m-%dT%H:%M:%S.%f") for e in epochs]
    cat["NORAD_CAT_ID"] = np.arange(90001, 90001 + n)
    cat["OBJECT_ID"] = [f"2026-{i // 30 + 1:03d}{chr(65 + i % 26)}" for i in range(n)]
    cat["EPHEMERIS_TYPE"] = 0
    cat["CLASSIFICATION_TYPE"] = "U"
    cat["ELEMENT_SET_NO"] = 999
    cat["REV_AT_EPOCH"] = 1000
    cat["MEAN_MOTION_DOT"] = 0.0
    cat["MEAN_MOTION_DDOT"] = 0.0
    cat["SOURCE_GROUP"] = "synthetic"
    cols = ["OBJECT_NAME", "OBJECT_ID", "EPOCH", "MEAN_MOTION", "ECCENTRICITY", "INCLINATION",
            "RA_OF_ASC_NODE", "ARG_OF_PERICENTER", "MEAN_ANOMALY", "EPHEMERIS_TYPE",
            "CLASSIFICATION_TYPE", "NORAD_CAT_ID", "ELEMENT_SET_NO", "REV_AT_EPOCH", "BSTAR",
            "MEAN_MOTION_DOT", "MEAN_MOTION_DDOT", "OBJECT_TYPE", "SOURCE_GROUP"]
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    cat[cols].to_csv(config.CATALOG_CSV, index=False)
    print(f"Синтетический каталог: {n} объектов -> {config.CATALOG_CSV}")
    print(cat["OBJECT_TYPE"].value_counts().to_string())


if __name__ == "__main__":
    main()
