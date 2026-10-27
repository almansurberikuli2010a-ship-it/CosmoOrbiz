"""
Шаг 3. Обучение MLP-классификатора риска.

Вход:  data/dataset.csv (из build_dataset.py)
Выход: models/orbital_shield_mlp.joblib — модель + список признаков
       reports/ — метрики, матрица ошибок, кривая обучения

Особенности:
  * разбиение train/test по спутникам (один спутник не попадает
    в обе части, иначе оценка будет завышена);
  * веса классов: «Высокий» встречается редко, без весов модель
    научилась бы всегда отвечать «безопасно»;
  * главная метрика — macro-F1 и полнота (recall) опасных классов,
    а не accuracy.

Запуск:
    python train.py
    python train.py --hidden 128 64 32 --alpha 1e-3
"""
import argparse
import json
from datetime import datetime, timezone

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (balanced_accuracy_score, classification_report,
                             confusion_matrix, f1_score, roc_auc_score)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

import config

META = ["snapshot", "t0_utc", "norad", "name"]
TARGETS = ["max_pc", "n_conj", "min_miss_km", "risk_class"]
INK, INK2, GRID, SURFACE = "#0b0b0b", "#52514e", "#e4e3df", "#fcfcfb"
BLUE_RAMP = ["#fcfcfb", "#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#104281"]


def split(df, y, seed):
    """~20% спутников в тест, с сохранением долей классов."""
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=seed)
    tr, te = next(sgkf.split(df, y, groups=df["norad"]))
    return tr, te


def evaluate(name, y_true, y_pred):
    labels = list(range(4))
    m = {
        "model": name,
        "macro_f1": f1_score(y_true, y_pred, labels=labels, average="macro", zero_division=0),
        "balanced_accuracy": balanced_accuracy_score(y_true, y_pred),
        "accuracy": float((y_true == y_pred).mean()),
        # классы упорядочены, поэтому ошибка «на один уровень» лучше, чем «через уровень»
        "within_one_level": float((np.abs(y_true - y_pred) <= 1).mean()),
    }
    danger = y_true >= 2
    # доля опасных (средний/высокий), которые модель назвала безопасными — худшая ошибка
    m["dangerous_called_safe"] = float((y_pred[danger] == 0).mean()) if danger.any() else None
    return m


def plot_confusion(cm, path):
    names = config.RISK_LEVELS_RU
    row = cm.sum(axis=1, keepdims=True)
    share = np.divide(cm, row, out=np.zeros_like(cm, dtype=float), where=row > 0)
    cmap = LinearSegmentedColormap.from_list("blue", BLUE_RAMP)
    fig, ax = plt.subplots(figsize=(6.4, 5.2), facecolor=SURFACE)
    ax.set_facecolor(SURFACE)
    ax.imshow(share, cmap=cmap, vmin=0, vmax=1)
    for i in range(4):
        for j in range(4):
            txt = f"{cm[i, j]}\n{100 * share[i, j]:.0f}%" if row[i, 0] else "—"
            ax.text(j, i, txt, ha="center", va="center", fontsize=10,
                    color="white" if share[i, j] > 0.55 else INK)
    ax.set_xticks(range(4), names, rotation=20, ha="right", color=INK2)
    ax.set_yticks(range(4), names, color=INK2)
    ax.set_xlabel("Предсказание модели", color=INK2)
    ax.set_ylabel("Истинный класс", color=INK2)
    ax.set_title("Матрица ошибок (тестовые спутники)", color=INK, loc="left", fontsize=12)
    for s in ax.spines.values():
        s.set_visible(False)
    ax.set_xticks(np.arange(-.5, 4), minor=True)
    ax.set_yticks(np.arange(-.5, 4), minor=True)
    ax.grid(which="minor", color=SURFACE, linewidth=2)
    ax.tick_params(which="both", length=0)
    fig.tight_layout()
    fig.savefig(path, dpi=150, facecolor=SURFACE)
    plt.close(fig)


def plot_learning(mlp, path):
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.4), facecolor=SURFACE)
    series = [(mlp.loss_curve_, "Ошибка на обучении (loss)")]
    if getattr(mlp, "validation_scores_", None) is not None:
        series.append((mlp.validation_scores_, "Точность на валидации"))
    for ax, (vals, title) in zip(axes, series):
        ax.set_facecolor(SURFACE)
        ax.plot(range(1, len(vals) + 1), vals, color="#2a78d6", linewidth=2)
        ax.set_title(title, color=INK, loc="left", fontsize=11)
        ax.set_xlabel("Эпоха", color=INK2)
        ax.grid(axis="y", color=GRID, linewidth=0.8)
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
        for s in ("left", "bottom"):
            ax.spines[s].set_color(GRID)
        ax.tick_params(colors=INK2)
    if len(series) == 1:
        axes[1].set_visible(False)
    fig.tight_layout()
    fig.savefig(path, dpi=150, facecolor=SURFACE)
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--hidden", type=int, nargs="+", default=[64, 32], help="размеры скрытых слоёв")
    ap.add_argument("--alpha", type=float, default=1e-3, help="L2-регуляризация")
    ap.add_argument("--lr", type=float, default=1e-3)
    ap.add_argument("--epochs", type=int, default=400)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--class-weight-power", type=float, default=1.0,
                    help="1 = полный баланс классов (по умолчанию), 0.5 = компромисс, 0 = без весов")
    args = ap.parse_args()

    df = pd.read_csv(config.DATASET_CSV)
    features = [c for c in df.columns if c not in META + TARGETS]
    X = df[features].to_numpy(float)
    y = df["risk_class"].to_numpy(int)
    print(f"Датасет: {len(df)} строк, {len(features)} признаков")
    present = np.unique(y)
    if len(present) < 4:
        missing = [config.RISK_LEVELS_RU[c] for c in range(4) if c not in present]
        print(f"ВНИМАНИЕ: в данных нет классов: {', '.join(missing)}. "
              f"Модель не сможет их предсказывать — увеличь --snapshots или окно прогноза.")

    tr, te = split(df, y, args.seed)
    Xtr, Xte, ytr, yte = X[tr], X[te], y[tr], y[te]
    print(f"Обучение: {len(tr)}, тест: {len(te)} (разные спутники)")
    w = compute_sample_weight("balanced", ytr) ** args.class_weight_power

    mlp = MLPClassifier(hidden_layer_sizes=tuple(args.hidden), activation="relu", solver="adam",
                        alpha=args.alpha, learning_rate_init=args.lr, batch_size=64,
                        max_iter=args.epochs, early_stopping=True, validation_fraction=0.15,
                        n_iter_no_change=25, random_state=args.seed)
    pipe = Pipeline([("scaler", StandardScaler()), ("mlp", mlp)])
    pipe.fit(Xtr, ytr, mlp__sample_weight=w)
    pred = pipe.predict(Xte)

    # базовые модели для сравнения: «всегда безопасно» и логистическая регрессия
    majority = np.full_like(yte, np.bincount(ytr).argmax())
    logreg = Pipeline([("scaler", StandardScaler()),
                       ("lr", LogisticRegression(max_iter=2000, class_weight="balanced"))])
    logreg.fit(Xtr, ytr)
    results = [evaluate("MLP", yte, pred),
               evaluate("Логистическая регрессия", yte, logreg.predict(Xte)),
               evaluate("Всегда «самый частый класс»", yte, majority)]
    # ранжирование: модель как фильтр — насколько опасные спутники оказываются вверху списка
    proba = np.zeros((len(te), 4))
    proba[:, pipe.classes_] = pipe.predict_proba(Xte)
    danger, score = yte >= 2, proba[:, 2] + proba[:, 3]
    order = np.argsort(-score)
    results[0]["danger_share"] = float(danger.mean())
    if 0 < danger.mean() < 1:
        results[0]["auc_danger"] = float(roc_auc_score(danger, score))
        for q in (0.1, 0.3):
            results[0][f"top{int(q * 100)}_catches"] = float(danger[order[: int(q * len(te))]].sum() / danger.sum())
        print(f"\nРанжирование: AUC {results[0]['auc_danger']:.3f}; в топ-10% — "
              f"{100 * results[0]['top10_catches']:.0f}% опасных, в топ-30% — {100 * results[0]['top30_catches']:.0f}%")

    config.REPORTS_DIR.mkdir(exist_ok=True)
    config.MODELS_DIR.mkdir(exist_ok=True)
    report = classification_report(yte, pred, labels=list(range(4)),
                                   target_names=config.RISK_LEVELS_RU, zero_division=0)
    cm = confusion_matrix(yte, pred, labels=list(range(4)))
    print("\n" + report)
    print(f"{'Модель':<30}{'macro-F1':>10}{'bal.acc':>10}{'acc':>8}{'±1 ур.':>8}{'опасн.→безоп.':>16}")
    for r in results:
        d = "—" if r["dangerous_called_safe"] is None else f"{100 * r['dangerous_called_safe']:.1f}%"
        print(f"{r['model']:<30}{r['macro_f1']:>10.3f}{r['balanced_accuracy']:>10.3f}"
              f"{r['accuracy']:>8.3f}{r['within_one_level']:>8.3f}{d:>16}")

    (config.REPORTS_DIR / "classification_report.txt").write_text(report, encoding="utf-8")
    plot_confusion(cm, config.REPORTS_DIR / "confusion_matrix.png")
    plot_learning(pipe.named_steps["mlp"], config.REPORTS_DIR / "learning_curve.png")

    # финальная модель — дообучаем на всех данных
    final = Pipeline([("scaler", StandardScaler()), ("mlp", MLPClassifier(**mlp.get_params()))])
    final.fit(X, y, mlp__sample_weight=compute_sample_weight("balanced", y) ** args.class_weight_power)
    bundle = {
        "pipeline": final,
        "features": features,
        "classes": [int(c) for c in final.classes_],
        "levels": config.RISK_LEVELS,
        "levels_ru": config.RISK_LEVELS_RU,
        "pc_thresholds": config.PC_THRESHOLDS,
        "screen_hours": config.SCREEN_HOURS,
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "test_metrics": results,
        "n_train": int(len(tr)),
        "n_test": int(len(te)),
    }
    joblib.dump(bundle, config.MODEL_PATH)
    (config.REPORTS_DIR / "metrics.json").write_text(
        json.dumps({"test": results, "confusion_matrix": cm.tolist(), "n_train": len(tr),
                    "n_test": len(te), "features": features, "hidden": args.hidden},
                   ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nМодель сохранена: {config.MODEL_PATH}")
    print(f"Отчёты: {config.REPORTS_DIR}/")


if __name__ == "__main__":
    main()
