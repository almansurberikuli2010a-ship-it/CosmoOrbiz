"""
Эксперимент: как сближения внутри одной группировки (Starlink–Starlink и т.п.)
влияют на модель.

Варианты разметки:
  A  как сейчас           — метка по всем сближениям, базовые признаки
  B  без внутренних пар   — метка только по сближениям с «чужими» объектами
                            (внутренняя пара = одна группировка или стыковка)
  C  с отдельным признаком — метка как в A + признаки группировки
  D  B + признаки группировки (для полноты)

Разбиения train/test (5-кратная кросс-валидация):
  по спутникам — один спутник не попадает в обе части (как в train.py)
  по оболочкам — вся оболочка группировки (группировка + высота ±5 км +
                 наклонение) целиком в train или в test, чтобы «близнецы»
                 не подсказывали ответ

Метки пересчитываются из файла сближений (config.CONJ_CSV), новый скрининг не нужен.

Запуск:
    python label_experiment.py
    python label_experiment.py --folds 3          # быстрее
Выход: reports/label_experiment.txt, reports/label_experiment.json
"""
import argparse
import json
import time

import numpy as np
import pandas as pd
from sklearn.metrics import f1_score
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

import config
import screening
from features import CONSTELLATION_FEATURES, constellation_features
from propagator import Catalog
from train import META, TARGETS, evaluate

VARIANTS = {
    "A как сейчас": ("all", False),
    "B без внутренних пар": ("ext", False),
    "C с отдельным признаком": ("all", True),
    "D без внутренних + признак": ("ext", True),
}


def load_labels(df):
    """Максимальная Pc по всем сближениям и только по внешним — для каждой строки датасета."""
    ev = pd.read_csv(config.CONJ_CSV, usecols=["snapshot", "target_norad", "target_name", "other_name",
                                               "other_type", "pc", "miss_km", "vrel_kms"])
    group = screening.same_group(ev["target_name"], np.full(len(ev), "PAYLOAD"),
                                 ev["other_name"], ev["other_type"].fillna("UNKNOWN"))
    docked = screening.is_docked(ev["miss_km"], ev["vrel_kms"])
    same = group | docked
    ev["same"] = same
    key = ["snapshot", "target_norad"]
    pc_all = ev.groupby(key)["pc"].max()
    pc_ext = ev[~ev["same"]].groupby(key)["pc"].max()
    n_intra = ev[ev["same"]].groupby(key).size()
    idx = pd.MultiIndex.from_arrays([df["snapshot"], df["norad"]], names=key)
    out = pd.DataFrame({
        "pc_all": pc_all.reindex(idx).fillna(0.0).to_numpy(),
        "pc_ext": pc_ext.reindex(idx).fillna(0.0).to_numpy(),
        "n_intra": n_intra.reindex(idx).fillna(0).to_numpy(int),
    })
    print(f"Сближений: {len(ev)}, внутренних: {same.sum()} ({100 * same.mean():.1f}%) — "
          f"одна группировка {group.sum()}, стыковка {docked.sum()} "
          f"(из них с разными названиями {(docked & ~group).sum()})")
    used = out["pc_all"] if config.LABEL_INTRA_GROUP else out["pc_ext"]
    mismatch = np.abs(np.log10(used + 1e-30) - np.log10(df["max_pc"].to_numpy() + 1e-30)) > 1e-6
    if mismatch.any():
        print(f"ВНИМАНИЕ: у {mismatch.sum()} строк Pc из файла сближений не совпадает с dataset.csv")
    return out


def shell_groups(df, grp):
    """Ключ оболочки: группировка + высота (шаг 10 км) + наклонение (шаг 1°)."""
    alt = ((df["perigee_alt_km"] + df["apogee_alt_km"]) / 2 / 10).round().astype(int)
    inc = df["inclination_deg"].round().astype(int)
    shell = pd.Series(grp).str.cat([alt.astype(str), inc.astype(str)], sep="|")
    return np.where(grp != "", shell, "sat:" + df["norad"].astype(str)), shell


def make_mlp(seed):
    # те же гиперпараметры, что по умолчанию в train.py
    mlp = MLPClassifier(hidden_layer_sizes=(64, 32), activation="relu", solver="adam", alpha=1e-3,
                        learning_rate_init=1e-3, batch_size=64, max_iter=400, early_stopping=True,
                        validation_fraction=0.15, n_iter_no_change=25, random_state=seed)
    return Pipeline([("scaler", StandardScaler()), ("mlp", mlp)])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--folds", type=int, default=5)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    df = pd.read_csv(config.DATASET_CSV)
    base = [c for c in df.columns if c not in META + TARGETS + CONSTELLATION_FEATURES]
    lab = load_labels(df)
    y = {"all": screening.pc_to_class(lab["pc_all"].to_numpy()), "ext": screening.pc_to_class(lab["pc_ext"].to_numpy())}

    cat = Catalog.load(config.CATALOG_CSV)
    pos = pd.Series(np.arange(len(cat)), index=cat.norad)
    pos = pos[~pos.index.duplicated()]
    tidx = pos.reindex(df["norad"]).to_numpy()
    if np.isnan(tidx).any():
        raise SystemExit("Не все спутники датасета есть в catalog.csv — каталог обновлялся после сборки датасета?")
    tidx = tidx.astype(int)
    cfeat = pd.DataFrame(constellation_features(cat, tidx))
    grp = screening.constellation_of(cat.name[tidx], cat.otype[tidx])
    is_starlink = grp == "STARLINK"

    # --- как меняются метки
    lines = ["Эксперимент с внутригрупповыми сближениями", "=" * 60,
             f"Строк: {len(df)}, Starlink: {100 * is_starlink.mean():.1f}%, "
             f"в какой-либо группировке: {100 * (grp != '').mean():.1f}%", ""]
    lines.append(f"{'Класс':<22}{'все пары':>10}{'без внутр.':>12}")
    for c in range(4):
        lines.append(f"{config.RISK_LEVELS_RU[c]:<22}{(y['all'] == c).sum():>10}{(y['ext'] == c).sum():>12}")
    changed = y["all"] != y["ext"]
    lines.append(f"\nКласс изменился у {changed.sum()} строк ({100 * changed.mean():.1f}%): "
                 f"Starlink {100 * changed[is_starlink].mean():.1f}%, "
                 f"остальные {100 * changed[~is_starlink].mean():.1f}%")
    lines.append(f"В среднем понижение на {(y['all'] - y['ext'])[changed].mean():.2f} уровня "
                 f"(внутренние пары могут только повышать риск)")
    top = (pd.DataFrame({"g": grp, "c": changed}).query("g != ''")
           .groupby("g")["c"].agg(["size", "mean"]).sort_values("size", ascending=False).head(8))
    lines.append("По группировкам (строк / доля с изменившимся классом): " +
                 ", ".join(f"{g} {int(r['size'])}/{100 * r['mean']:.0f}%" for g, r in top.iterrows()))

    # --- разбиения: одинаковые фолды для всех вариантов (стратификация по текущей метке)
    shell_key, shell = shell_groups(df, grp)
    sizes = pd.Series(shell[grp != ""]).value_counts()
    lines.append(f"\nОболочек группировок: {len(sizes)}, крупнейшая: {sizes.index[0]} "
                 f"({100 * sizes.iloc[0] / len(df):.1f}% строк)")
    splits = {}
    for name, groups in (("по спутникам", df["norad"].to_numpy()), ("по оболочкам", shell_key)):
        sgkf = StratifiedGroupKFold(n_splits=args.folds, shuffle=True, random_state=args.seed)
        splits[name] = list(sgkf.split(df, y["all"], groups=groups))

    results = []
    for split_name, folds in splits.items():
        for vname, (lbl, with_c) in VARIANTS.items():
            X = df[base].to_numpy(float)
            if with_c:
                X = np.hstack([X, cfeat.to_numpy(float)])
            yy = y[lbl]
            fold_m = []
            t = time.time()
            for k, (tr, te) in enumerate(folds):
                model = make_mlp(args.seed + k)
                model.fit(X[tr], yy[tr], mlp__sample_weight=compute_sample_weight("balanced", yy[tr]))
                pred = model.predict(X[te])
                m = evaluate(vname, yy[te], pred)
                # общий «эталон» для всех вариантов: насколько хорошо модель предсказывает внешний риск
                m["macro_f1_vs_ext"] = f1_score(y["ext"][te], pred, labels=list(range(4)),
                                                average="macro", zero_division=0)
                for sub, mask in (("starlink", is_starlink[te]), ("other", ~is_starlink[te])):
                    m[f"macro_f1_{sub}"] = (f1_score(yy[te][mask], pred[mask], labels=list(range(4)),
                                                     average="macro", zero_division=0) if mask.any() else None)
                fold_m.append(m)
            agg = {"split": split_name, "variant": vname, "labels": lbl, "constellation_features": with_c}
            for key in fold_m[0]:
                if key == "model":
                    continue
                vals = np.array([f[key] for f in fold_m if f[key] is not None], float)
                agg[key] = float(vals.mean()) if len(vals) else None
                agg[key + "_std"] = float(vals.std()) if len(vals) else None
            results.append(agg)
            print(f"  {split_name:<13} {vname:<28} macro-F1 {agg['macro_f1']:.3f} ± {agg['macro_f1_std']:.3f}"
                  f"  ({time.time() - t:.0f} с)", flush=True)

    lines.append(f"\nMLP, {args.folds}-кратная кросс-валидация (среднее ± разброс по фолдам).")
    lines.append("Метрики считаются по меткам своего варианта; «F1 внешн.» — по меткам без внутренних пар,")
    lines.append("это общая линейка для всех вариантов.\n")
    hdr = (f"{'Вариант':<28}{'macro-F1':>14}{'bal.acc':>9}{'±1 ур.':>8}{'опасн→безоп':>12}"
           f"{'F1 внешн.':>11}{'F1 Starlink':>12}{'F1 прочие':>11}")
    for split_name in splits:
        lines += [f"Разбиение {split_name}", hdr, "-" * len(hdr)]
        for r in (r for r in results if r["split"] == split_name):
            dcs = "—" if r["dangerous_called_safe"] is None else f"{100 * r['dangerous_called_safe']:.1f}%"
            fo = "—" if r["macro_f1_other"] is None else f"{r['macro_f1_other']:.3f}"
            lines.append(f"{r['variant']:<28}{r['macro_f1']:>8.3f}±{r['macro_f1_std']:.3f}"
                         f"{r['balanced_accuracy']:>9.3f}{r['within_one_level']:>8.3f}{dcs:>12}"
                         f"{r['macro_f1_vs_ext']:>11.3f}{r['macro_f1_starlink']:>12.3f}{fo:>11}")
        lines.append("")

    text = "\n".join(lines)
    print("\n" + text)
    config.REPORTS_DIR.mkdir(exist_ok=True)
    (config.REPORTS_DIR / "label_experiment.txt").write_text(text, encoding="utf-8")
    (config.REPORTS_DIR / "label_experiment.json").write_text(
        json.dumps({"results": results, "base_features": base, "constellation_features": CONSTELLATION_FEATURES,
                    "folds": args.folds}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nОтчёт: {config.REPORTS_DIR / 'label_experiment.txt'}")


if __name__ == "__main__":
    main()
