"""
Шаг 4. Оценка риска для выбранного спутника — то, что будет вызываться,
когда на сайте нажмут на спутник.

Возвращает JSON:
  * risk_level      — уровень риска от MLP (мгновенно)
  * probabilities   — вероятности всех 4 классов
  * threats         — (с --screen) список опасных объектов из точного расчёта:
                      кто, когда (TCA), промах в км, скорость встречи, Pc.
                      Эти объекты на 3D-модели можно подсветить.

Запуск:
    python predict.py 25544                 # по номеру NORAD
    python predict.py "ISS (ZARYA)" --screen
    python predict.py 25544 --screen --hours 24 --json result.json

Из кода (например, будущего сервера сайта):
    from predict import RiskService
    svc = RiskService()
    svc.assess("25544", screen=True)
"""
import argparse
import json
from datetime import datetime, timezone

import joblib
import numpy as np

import config
import screening
from features import compute_features
from propagator import Catalog, Propagator, datetime_to_jd


class RiskService:
    def __init__(self, catalog_path=config.CATALOG_CSV, model_path=config.MODEL_PATH):
        self.bundle = joblib.load(model_path)
        self.prop = Propagator(Catalog.load(catalog_path))
        self.cat = self.prop.cat

    def assess(self, key, screen=False, hours=None, t0=None, top=10):
        cat = self.cat
        i = cat.index_of(key)
        t0 = t0 or datetime.now(timezone.utc)
        t0_jd = datetime_to_jd(t0)

        X = compute_features(self.prop, [i], t0_jd)[self.bundle["features"]].to_numpy(float)
        pipe = self.bundle["pipeline"]
        proba_known = pipe.predict_proba(X)[0]
        proba = np.zeros(4)
        proba[self.bundle["classes"]] = proba_known
        level = int(proba.argmax())

        result = {
            "norad": int(cat.norad[i]),
            "name": str(cat.name[i]),
            "object_type": str(cat.otype[i]),
            "t0_utc": t0.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "orbit": {"perigee_km": round(float(cat.perigee_alt[i]), 1),
                      "apogee_km": round(float(cat.apogee_alt[i]), 1),
                      "inclination_deg": round(float(np.degrees(cat.inc[i])), 2)},
            "risk_level": config.RISK_LEVELS[level],
            "risk_level_ru": config.RISK_LEVELS_RU[level],
            "risk_index": level,
            "probabilities": {config.RISK_LEVELS[k]: round(float(proba[k]), 4) for k in range(4)},
            "source": "mlp",
        }
        if cat.otype[i] != "PAYLOAD":
            result["warning"] = "Модель обучена на спутниках (PAYLOAD); для мусора оценка приблизительная."

        if screen:
            hours = hours or config.SCREEN_HOURS
            ev = screening.screen(self.prop, [i], t0_jd, hours=hours, verbose=False)
            ev = ev[ev["target"] == i]
            passes = ev.groupby("other_norad").size()
            # для 3D-сцены — один самый опасный проход на каждый объект
            ev = ev.sort_values("pc", ascending=False).drop_duplicates("other_norad").head(top)
            max_pc = float(ev["pc"].max()) if len(ev) else 0.0
            phys = int(screening.pc_to_class(max_pc))
            result["screening"] = {
                "hours": hours,
                "max_pc": max_pc,
                "risk_level": config.RISK_LEVELS[phys],
                "risk_level_ru": config.RISK_LEVELS_RU[phys],
                "agrees_with_mlp": phys == level,
            }
            result["threats"] = [{
                "norad": int(r.other_norad), "name": r.other_name, "type": r.other_type,
                "tca_utc": r.tca_utc, "miss_km": round(float(r.miss_km), 3),
                "rel_speed_kms": round(float(r.vrel_kms), 2), "pc": float(f"{r.pc:.3e}"),
                "risk_level": config.RISK_LEVELS[int(screening.pc_to_class(r.pc))],
                "close_passes": int(passes[r.other_norad]),
            } for r in ev.itertuples()]
        return result


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("satellite", nargs="+", help="номер NORAD или название")
    ap.add_argument("--screen", action="store_true", help="плюс точный поиск сближений")
    ap.add_argument("--hours", type=float, default=None)
    ap.add_argument("--json", help="сохранить результат в файл")
    args = ap.parse_args()

    svc = RiskService()
    out = [svc.assess(s, screen=args.screen, hours=args.hours) for s in args.satellite]
    text = json.dumps(out if len(out) > 1 else out[0], ensure_ascii=False, indent=2)
    print(text)
    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            f.write(text)


if __name__ == "__main__":
    main()
