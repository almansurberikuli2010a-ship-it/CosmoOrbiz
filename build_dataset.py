"""
Шаг 2. Сборка обучающего датасета.

Для каждого спутника (PAYLOAD):
  * признаки X — считаются мгновенно в момент t0 (features.py);
  * метка y   — «честный» ответ: полный поиск сближений на SCREEN_HOURS
                вперёд, максимальная вероятность столкновения -> класс риска.

Так MLP учится по быстрым признакам предсказывать результат
дорогого физического расчёта.

Запуск:
    python build_dataset.py                       # t0 = сейчас, 1 снимок
    python build_dataset.py --snapshots 3         # 3 момента времени (больше данных)
    python build_dataset.py --max-targets 2000    # случайная выборка спутников (быстрее)
"""
import argparse
import sys
import time
from datetime import datetime, timezone

import numpy as np
import pandas as pd

import config
import screening
from features import compute_features
from propagator import Catalog, Propagator, datetime_to_jd, jd_to_datetime


LABEL_COLS = ["max_pc", "n_conj", "min_miss_km", "risk_class"]
META_COLS = ["snapshot", "t0_utc", "norad", "name"]


def recompute_features(prop):
    """Новые признаки для старых меток — удобно, когда экспериментируешь с features.py."""
    cat = prop.cat
    old = pd.read_csv(config.DATASET_CSV)
    parts = []
    for (snap, t0s), grp in old.groupby(["snapshot", "t0_utc"]):
        t0_jd = datetime_to_jd(datetime.fromisoformat(t0s.replace("Z", "+00:00")))
        idx = np.array([cat.index_of(n) for n in grp["norad"]])
        X = compute_features(prop, idx, t0_jd).reset_index(drop=True)
        parts.append(pd.concat([grp[META_COLS].reset_index(drop=True), X,
                                grp[LABEL_COLS].reset_index(drop=True)], axis=1))
        print(f"  снимок {snap}: {len(grp)} спутников")
    data = pd.concat(parts, ignore_index=True)
    data.to_csv(config.DATASET_CSV, index=False)
    print(f"Признаки пересчитаны: {data.shape[1] - len(META_COLS) - len(LABEL_COLS)} шт. -> {config.DATASET_CSV}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--t0", help="начальный момент UTC, например 2026-10-24T12:00:00 (по умолчанию — сейчас)")
    ap.add_argument("--hours", type=float, default=config.SCREEN_HOURS, help="окно прогноза, ч")
    ap.add_argument("--step", type=float, default=config.SCREEN_STEP_S, help="шаг по времени, с")
    ap.add_argument("--snapshots", type=int, default=1, help="сколько моментов t0 взять")
    ap.add_argument("--snapshot-gap", type=float, default=12.0, help="интервал между снимками, ч")
    ap.add_argument("--max-targets", type=int, default=0, help="ограничить число спутников (0 = все)")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--features-only", action="store_true",
                    help="пересчитать только признаки в готовом dataset.csv (метки не трогать)")
    # для параллельной сборки: каждый процесс пишет свои файлы, потом их склеивают
    ap.add_argument("--out", default=str(config.DATASET_CSV), help="куда сохранить датасет")
    ap.add_argument("--conj-out", default=str(config.CONJ_CSV), help="куда сохранить сближения")
    ap.add_argument("--snapshot-offset", type=int, default=0, help="с какого номера нумеровать снимки")
    args = ap.parse_args()

    cat = Catalog.load(config.CATALOG_CSV)
    prop = Propagator(cat)
    cat = prop.cat
    print(f"Каталог: {len(cat)} объектов, пропагатор: {prop.backend}")

    if args.features_only:
        return recompute_features(prop)

    targets = np.flatnonzero(cat.otype == "PAYLOAD")
    if len(targets) == 0:
        sys.exit("В каталоге нет спутников (PAYLOAD), только мусор — не из чего собирать датасет.\n"
                 "Скорее всего, при загрузке не скачалась группа active. "
                 "Запусти заново: python3 data_download.py --force и посмотри, что он пишет.")
    if args.max_targets and len(targets) > args.max_targets:
        rng = np.random.default_rng(args.seed)
        targets = np.sort(rng.choice(targets, args.max_targets, replace=False))
    print(f"Спутников для датасета: {len(targets)}")

    t0 = datetime.fromisoformat(args.t0).replace(tzinfo=timezone.utc) if args.t0 else datetime.now(timezone.utc)
    t0_jd = datetime_to_jd(t0)

    rows, all_events = [], []
    for k in range(args.snapshots):
        tk = t0_jd + k * args.snapshot_gap / 24.0
        print(f"\nСнимок {k + 1}/{args.snapshots}: t0 = {jd_to_datetime(tk):%Y-%m-%d %H:%M} UTC")
        t = time.time()
        X = compute_features(prop, targets, tk)
        print(f"  признаки: {time.time() - t:.1f} с")
        t = time.time()
        ev = screening.screen(prop, targets, tk, hours=args.hours, step_s=args.step)
        print(f"  сближений найдено: {len(ev)} ({time.time() - t:.1f} с)")
        risk = screening.risk_per_target(ev, targets)
        df = X.join(risk)
        bad = X.isna().any(axis=1).to_numpy()
        if bad.any():
            print(f"  пропущено {bad.sum()} спутников: не удалось пропагировать в t0")
        df.insert(0, "snapshot", args.snapshot_offset + k)
        df.insert(1, "t0_utc", f"{jd_to_datetime(tk):%Y-%m-%dT%H:%M:%SZ}")
        df.insert(2, "norad", cat.norad[targets])
        df.insert(3, "name", cat.name[targets])
        rows.append(df[~bad])
        ev.insert(0, "snapshot", args.snapshot_offset + k)
        all_events.append(ev)

    data = pd.concat(rows, ignore_index=True)
    data.to_csv(args.out, index=False)
    pd.concat(all_events, ignore_index=True).to_csv(args.conj_out, index=False)

    print(f"\nДатасет: {len(data)} строк -> {args.out}")
    counts = data["risk_class"].value_counts().reindex(range(4), fill_value=0)
    for c, n in counts.items():
        print(f"  {c} {config.RISK_LEVELS_RU[c]:<20} {n:6d}  ({100 * n / len(data):.1f}%)")


if __name__ == "__main__":
    main()
