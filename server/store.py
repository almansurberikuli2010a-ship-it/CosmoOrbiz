"""
Данные для сайта: каталог объектов, TLE для браузера и оценки риска от MLP.

Как это работает:
  * при старте берём каталог: свежий с CelesTrak, если сохранённый старше
    CATALOG_MAX_AGE_H часов (иначе — сохранённый), и строим пропагатор SGP4;
  * браузер получает TLE всех объектов и сам считает их положения (satellite.js);
  * в фоновом потоке модель оценивает все спутники разом (~1.5–2 мин),
    результат сохраняется в data/site/risk_cache.json — после перезапуска
    сервер подхватывает его сразу;
  * пока пакетная оценка не готова, спутник оценивается по запросу (~1 с).

Настройки — переменные окружения (значения по умолчанию в скобках):
  ORBITAL_SITE_DIR          папка данных сайта (data/site)
  ORBITAL_CATALOG_MAX_AGE_H скачивать каталог заново, если он старше (12 ч)
  ORBITAL_RISK_MAX_AGE_H    пересчитывать оценки всех спутников, если старше (6 ч)
  ORBITAL_OFFLINE=1         никогда не скачивать каталог
  ORBITAL_BATCH=0           не считать все спутники в фоне (только по запросу)
  ORBITAL_BATCH_SIZE        спутников за один проход (1500) — меньше = меньше памяти
  ORBITAL_MODEL_PATH        файл модели (models/orbital_shield_mlp.joblib)
  ORBITAL_THREATS=0         не искать угрозы точным расчётом (скрининг всех спутников
                            на 48 ч: ~10 мин и ~0.5 ГБ памяти — на слабом хостинге отключите)
"""
import gzip
import json
import logging
import os
import shutil
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sgp4.exporter import export_tle

import config
import data_download
from features import compute_features
from propagator import Catalog, Propagator, datetime_to_jd, jd_to_datetime
import screening
from screening import constellation_of

log = logging.getLogger("orbital_shield")

SITE_DIR = Path(os.environ.get("ORBITAL_SITE_DIR", config.DATA_DIR / "site"))
SITE_CATALOG = SITE_DIR / "catalog.csv"
RISK_CACHE = SITE_DIR / "risk_cache.json"
CATALOG_MAX_AGE_H = float(os.environ.get("ORBITAL_CATALOG_MAX_AGE_H", 12))
RISK_MAX_AGE_H = float(os.environ.get("ORBITAL_RISK_MAX_AGE_H", 6))
OFFLINE = os.environ.get("ORBITAL_OFFLINE", "0") == "1"
BATCH = os.environ.get("ORBITAL_BATCH", "1") == "1"
BATCH_SIZE = int(os.environ.get("ORBITAL_BATCH_SIZE", 1500))
MODEL_PATH = Path(os.environ.get("ORBITAL_MODEL_PATH", config.MODEL_PATH))
THREATS = os.environ.get("ORBITAL_THREATS", "1") == "1"
THREATS_CACHE = SITE_DIR / "threats_cache.json"
THREATS_TOP = 8                                  # сколько угроз хранить на спутник

TYPE_CODE = {"PAYLOAD": "P", "DEBRIS": "D", "ROCKET BODY": "R"}


def _utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@dataclass
class Snapshot:
    """Всё, что относится к одному каталогу. Подменяется целиком при обновлении."""
    version: str                      # «время файла каталога + размер»: метка для кэша оценок
    catalog_path: Path
    loaded_at: datetime
    cat: Catalog
    prop: Propagator
    index: dict                       # NORAD -> индекс в каталоге
    groups: np.ndarray                # группировка каждого объекта ('' — нет)
    catalog_json: bytes               # готовый ответ /api/catalog
    catalog_gzip: bytes
    counts: dict
    risk: dict = field(default_factory=dict)        # NORAD -> [класс, p0, p1, p2, p3]
    risk_t0: datetime | None = None
    live: dict = field(default_factory=dict)        # оценки по запросу (до готовности пакета)
    threats: dict = field(default_factory=dict)     # NORAD -> угрозы по точному расчёту
    threats_t0: datetime | None = None


class RiskStore:
    def __init__(self):
        self.bundle = joblib.load(MODEL_PATH)
        self.features = self.bundle["features"]
        self.snap: Snapshot | None = None
        self.state = "starting"               # starting | ready | error
        self.error = None
        self.batch = {"state": "idle", "progress": 0.0, "started": None, "seconds": None}
        self.threat_job = {"state": "idle" if THREATS else "disabled", "started": None, "seconds": None}
        self._live_slots = threading.Semaphore(2)   # не больше двух расчётов по запросу сразу
        self._batch_lock = threading.Lock()

    # ------------------------------------------------------------------ каталог
    def _catalog_file(self) -> Path:
        age_h = (time.time() - SITE_CATALOG.stat().st_mtime) / 3600 if SITE_CATALOG.exists() else None
        if not OFFLINE and (age_h is None or age_h > CATALOG_MAX_AGE_H):
            log.info("скачиваю свежий каталог с CelesTrak ...")
            try:
                data_download.build_catalog(out_path=SITE_CATALOG)
            except Exception as e:                       # сеть, лимиты CelesTrak
                log.warning("каталог не скачался: %s", e)
        if SITE_CATALOG.exists():
            return SITE_CATALOG
        # нет своего каталога и не скачался — берём каталог проекта (копией, чтобы не трогать его)
        if config.CATALOG_CSV.exists():
            SITE_DIR.mkdir(parents=True, exist_ok=True)
            shutil.copy2(config.CATALOG_CSV, SITE_CATALOG)
            return SITE_CATALOG
        raise RuntimeError("Нет каталога: запусти python3 data_download.py")

    def _build_snapshot(self) -> Snapshot:
        path = self._catalog_file()
        st = path.stat()
        cat = Catalog.load(path)
        prop = Propagator(cat)
        cat = prop.cat
        groups = constellation_of(cat.name, cat.otype)
        rows = []
        for k, sat in enumerate(prop._sats):
            l1, l2 = export_tle(sat)
            rows.append([int(cat.norad[k]), str(cat.name[k]), TYPE_CODE.get(cat.otype[k], "U"), l1, l2])
        counts = {"objects": len(cat),
                  "payloads": int((cat.otype == "PAYLOAD").sum()),
                  "debris": int((cat.otype == "DEBRIS").sum()),
                  "rocket_bodies": int((cat.otype == "ROCKET BODY").sum())}
        epoch_med = jd_to_datetime(float(np.median(cat.epoch_jd)))
        body = {"version": f"{int(st.st_mtime)}-{st.st_size}",
                "catalog_time": _utc(datetime.fromtimestamp(st.st_mtime, timezone.utc)),
                "epoch_median": _utc(epoch_med),
                "counts": counts,
                "fields": ["norad", "name", "type", "tle1", "tle2"],
                "objects": rows}
        raw = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()
        return Snapshot(version=body["version"], catalog_path=path, loaded_at=datetime.now(timezone.utc),
                        cat=cat, prop=prop, index={int(n): k for k, n in enumerate(cat.norad)},
                        groups=groups, catalog_json=raw, catalog_gzip=gzip.compress(raw, 6), counts=counts)

    # ------------------------------------------------------------------ жизненный цикл
    def start(self):
        """Загрузить данные и дальше раз в несколько минут проверять, не пора ли обновить."""
        try:
            snap = self._build_snapshot()
            self._load_cache(snap)
            self.snap = snap
            self.state = "ready"
            log.info("каталог: %d объектов (%s)", len(snap.cat), snap.catalog_path)
        except Exception as e:
            self.state, self.error = "error", str(e)
            log.exception("не удалось загрузить данные")
            return
        while True:
            try:
                self._maybe_refresh()
            except Exception:
                log.exception("ошибка при обновлении данных")
            time.sleep(300)

    def _maybe_refresh(self):
        snap = self.snap
        age_h = (time.time() - snap.catalog_path.stat().st_mtime) / 3600
        if not OFFLINE and age_h > CATALOG_MAX_AGE_H:
            new = self._build_snapshot()
            if new.version != snap.version:
                log.info("новый каталог: %d объектов", len(new.cat))
                self._load_cache(new)
                self.snap = snap = new
        if BATCH:
            stale = snap.risk_t0 is None or \
                (datetime.now(timezone.utc) - snap.risk_t0).total_seconds() / 3600 > RISK_MAX_AGE_H
            if stale:
                self._run_batch(snap)
        # угрозы считаем от того же момента, что и оценки нейросети, — их можно сравнивать
        if THREATS and snap.risk_t0 is not None and snap.threats_t0 != snap.risk_t0:
            self._run_threats(snap)

    # ------------------------------------------------------------------ угрозы (точный расчёт)
    def _run_threats(self, snap: Snapshot):
        t0 = snap.risk_t0
        started = time.time()
        self.threat_job = {"state": "running", "started": _utc(datetime.now(timezone.utc)), "seconds": None}
        log.info("точный расчёт угроз для всех спутников на %d ч ...", config.SCREEN_HOURS)
        try:
            targets = np.flatnonzero(snap.cat.otype == "PAYLOAD")
            ev = screening.screen(snap.prop, targets, datetime_to_jd(t0), verbose=False)
            threats = {}
            if len(ev):
                ev = ev.sort_values("pc", ascending=False)
                intra = ev["intra_pair"].astype(bool)
                n_intra = ev[intra].groupby("target_norad").size()
                ext = ev[~intra]
                passes = ext.groupby(["target_norad", "other_norad"]).size()
                top = ext.drop_duplicates(["target_norad", "other_norad"])   # самый опасный проход каждой пары
                for norad, g in top.groupby("target_norad", sort=False):
                    g = g.head(THREATS_TOP)
                    threats[int(norad)] = {
                        "max_pc": float(g["pc"].iloc[0]),
                        "n_ext": int((ext["target_norad"] == norad).sum()),
                        "items": [[int(r.other_norad), str(r.other_name), TYPE_CODE.get(r.other_type, "U"),
                                   r.tca_utc, round(float(r.miss_km), 3), round(float(r.vrel_kms), 2),
                                   float(f"{r.pc:.3e}"), int(passes[(norad, r.other_norad)])]
                                  for r in g.itertuples()],
                    }
                for norad, n in n_intra.items():
                    threats.setdefault(int(norad), {"max_pc": 0.0, "n_ext": 0, "items": []})["n_intra"] = int(n)
            snap.threats, snap.threats_t0 = threats, t0
            secs = time.time() - started
            self.threat_job = {"state": "done", "started": self.threat_job["started"], "seconds": round(secs, 1)}
            log.info("угрозы готовы: %d сближений, %.0f с", len(ev), secs)
            tmp = THREATS_CACHE.with_suffix(".tmp")
            tmp.write_text(json.dumps({"t0_utc": _utc(t0), "catalog_version": snap.version,
                                       "results": threats}, ensure_ascii=False, separators=(",", ":")))
            tmp.replace(THREATS_CACHE)
        except Exception as e:
            self.threat_job = {"state": "error", "started": None, "seconds": None, "error": str(e)}
            log.exception("точный расчёт угроз не удался")

    def _threat_info(self, snap: Snapshot, norad: int) -> dict:
        if not THREATS:
            return {"available": False, "reason": "disabled"}
        if snap.threats_t0 is None or snap.threats_t0 != snap.risk_t0:
            return {"available": False, "reason": "computing"}
        t = snap.threats.get(norad, {"max_pc": 0.0, "n_ext": 0, "items": []})
        items = [{"norad": i[0], "name": i[1], "type": i[2], "tca_utc": i[3], "miss_km": i[4],
                  "rel_speed_kms": i[5], "pc": i[6], "level": int(screening.pc_to_class(i[6])), "passes": i[7]}
                 for i in t["items"]]
        return {"available": True, "t0_utc": _utc(snap.threats_t0), "hours": config.SCREEN_HOURS,
                "max_pc": t["max_pc"], "level": int(screening.pc_to_class(t["max_pc"])),
                "n_external": t["n_ext"], "n_intra": t.get("n_intra", 0), "items": items}

    # ------------------------------------------------------------------ оценки
    def _load_cache(self, snap: Snapshot):
        if not RISK_CACHE.exists():
            return
        try:
            c = json.loads(RISK_CACHE.read_text())
        except Exception:
            return
        if c.get("catalog_version") != snap.version or c.get("model_trained_at") != self.bundle["trained_at"]:
            return
        snap.risk = {int(k): v for k, v in c["results"].items()}
        snap.risk_t0 = datetime.fromisoformat(c["t0_utc"].replace("Z", "+00:00"))
        log.info("оценки всех спутников взяты из кэша (t0 = %s)", c["t0_utc"])
        if THREATS_CACHE.exists():
            try:
                tc = json.loads(THREATS_CACHE.read_text())
                if tc.get("catalog_version") == snap.version and tc.get("t0_utc") == c["t0_utc"]:
                    snap.threats = {int(k): v for k, v in tc["results"].items()}
                    snap.threats_t0 = snap.risk_t0
                    log.info("угрозы взяты из кэша")
            except Exception:
                pass

    def _predict(self, snap: Snapshot, idx, t0_jd):
        """Классы и вероятности для объектов idx. Возвращает (маска «посчитано», класс, вероятности 4)."""
        X = compute_features(snap.prop, idx, t0_jd)[self.features].to_numpy(float)
        good = np.isfinite(X).all(axis=1)
        proba = np.zeros((len(idx), 4))
        if good.any():
            proba[np.ix_(good, self.bundle["classes"])] = self.bundle["pipeline"].predict_proba(X[good])
        return good, proba.argmax(axis=1), proba

    def _run_batch(self, snap: Snapshot):
        if not self._batch_lock.acquire(blocking=False):
            return
        try:
            t0 = datetime.now(timezone.utc)
            t0_jd = datetime_to_jd(t0)
            targets = np.flatnonzero(snap.cat.otype == "PAYLOAD")
            self.batch = {"state": "running", "progress": 0.0, "started": _utc(t0), "seconds": None}
            log.info("модель оценивает %d спутников ...", len(targets))
            results = {}
            for s in range(0, len(targets), BATCH_SIZE):
                tg = targets[s:s + BATCH_SIZE]
                good, level, proba = self._predict(snap, tg, t0_jd)
                for k in np.flatnonzero(good):
                    results[int(snap.cat.norad[tg[k]])] = [int(level[k])] + [round(float(p), 4) for p in proba[k]]
                self.batch["progress"] = min(1.0, (s + len(tg)) / len(targets))
            secs = (datetime.now(timezone.utc) - t0).total_seconds()
            snap.risk, snap.risk_t0 = results, t0
            snap.live.clear()
            self.batch = {"state": "done", "progress": 1.0, "started": _utc(t0), "seconds": round(secs, 1)}
            log.info("оценки готовы: %d спутников за %.0f с", len(results), secs)
            RISK_CACHE.parent.mkdir(parents=True, exist_ok=True)
            tmp = RISK_CACHE.with_suffix(".tmp")
            tmp.write_text(json.dumps({"t0_utc": _utc(t0), "catalog_version": snap.version,
                                       "model_trained_at": self.bundle["trained_at"],
                                       "results": results}, separators=(",", ":")))
            tmp.replace(RISK_CACHE)
        except Exception as e:
            self.batch = {"state": "error", "progress": 0.0, "started": None, "seconds": None, "error": str(e)}
            log.exception("пакетная оценка не удалась")
        finally:
            self._batch_lock.release()

    def risk(self, norad: int) -> dict | None:
        snap = self.snap
        if snap is None or norad not in snap.index:
            return None
        k = snap.index[norad]
        cat = snap.cat
        n_rev_day = cat.n_rad_s[k] * 86400 / (2 * np.pi)
        out = {
            "norad": norad,
            "name": str(cat.name[k]),
            "type": str(cat.otype[k]),
            "constellation": snap.groups[k] or None,
            "orbit": {"perigee_km": round(float(cat.perigee_alt[k]), 1),
                      "apogee_km": round(float(cat.apogee_alt[k]), 1),
                      "inclination_deg": round(float(np.degrees(cat.inc[k])), 2),
                      "period_min": round(1440.0 / n_rev_day, 1),
                      "epoch_utc": _utc(jd_to_datetime(float(cat.epoch_jd[k])))},
        }
        if cat.otype[k] != "PAYLOAD":
            out["model"] = {"available": False, "reason": "not_payload"}
            out["threats"] = {"available": False, "reason": "not_payload"}
            return out
        out["threats"] = self._threat_info(snap, norad)
        if norad in snap.risk:
            r, t0, source = snap.risk[norad], snap.risk_t0, "batch"
        elif norad in snap.live:
            r, t0 = snap.live[norad]
            source = "live"
        else:
            with self._live_slots:
                t0 = datetime.now(timezone.utc)
                good, level, proba = self._predict(snap, np.array([k]), datetime_to_jd(t0))
            if not good[0]:
                out["model"] = {"available": False, "reason": "propagation_failed"}
                return out
            r = [int(level[0])] + [round(float(p), 4) for p in proba[0]]
            snap.live[norad] = (r, t0)
            source = "live"
        out["model"] = {"available": True, "level": r[0], "probabilities": r[1:],
                        "t0_utc": _utc(t0), "source": source}
        return out

    # ------------------------------------------------------------------ сводки для сайта
    def _physics_level(self, snap: Snapshot, norad: int):
        if snap.threats_t0 is None or snap.threats_t0 != snap.risk_t0:
            return None
        t = snap.threats.get(norad)
        return int(screening.pc_to_class(t["max_pc"])) if t else 0

    def risks(self) -> dict:
        """Уровни риска всех оценённых спутников — для раскраски глобуса."""
        snap = self.snap
        norads = list(snap.risk.keys())
        physics_ready = snap.threats_t0 is not None and snap.threats_t0 == snap.risk_t0
        return {"t0_utc": _utc(snap.risk_t0) if snap.risk_t0 else None,
                "norad": norads,
                "model": [snap.risk[n][0] for n in norads],
                "physics": [self._physics_level(snap, n) for n in norads] if physics_ready else None}

    def stats(self) -> dict:
        """Статистика по группировкам и сравнение нейросети с точным расчётом на сегодняшних данных."""
        snap = self.snap
        if not snap.risk or snap.threats_t0 is None or snap.threats_t0 != snap.risk_t0:
            return {"available": False, "reason": "computing"}
        norads = np.array(list(snap.risk.keys()))
        rows = np.array([snap.risk[n] for n in norads])
        model, proba = rows[:, 0].astype(int), rows[:, 1:]
        physics = np.array([self._physics_level(snap, int(n)) for n in norads])
        groups = np.array([snap.groups[snap.index[int(n)]] or "OTHER" for n in norads])
        out_groups = []
        names, counts = np.unique(groups, return_counts=True)
        top = [g for g, _ in sorted(zip(names, counts), key=lambda t: -t[1]) if g != "OTHER"][:7]
        for g in top + ["OTHER"]:
            m = groups == g if g in top else ~np.isin(groups, top)
            out_groups.append({"name": g, "count": int(m.sum()),
                               "physics": np.bincount(physics[m], minlength=4).tolist(),
                               "model": np.bincount(model[m], minlength=4).tolist()})
        danger = physics >= 2
        score = proba[:, 2] + proba[:, 3]
        order = np.argsort(-score)
        cm = np.zeros((4, 4), int)
        np.add.at(cm, (physics, model), 1)
        res = {"available": True, "t0_utc": _utc(snap.risk_t0), "n": int(len(norads)),
               "groups": out_groups, "confusion": cm.tolist(),
               "agreement": float((physics == model).mean()),
               "within_one": float((np.abs(physics - model) <= 1).mean()),
               "danger_share": float(danger.mean()),
               "dangerous_called_safe": float((model[danger] == 0).mean()) if danger.any() else None}
        if 0 < danger.mean() < 1:
            from sklearn.metrics import roc_auc_score
            res["auc_danger"] = float(roc_auc_score(danger, score))
            res["top30_catches"] = float(danger[order[: int(0.3 * len(order))]].sum() / danger.sum())
        return res

    def kazakhstan(self) -> list:
        """Спутники Казахстана: оценка нейросети, вердикт физики и ближайшая угроза."""
        out = []
        for norad, kind in config.KZ_SATELLITES.items():
            info = self.risk(norad)
            if info is None:
                continue
            th = info.get("threats", {})
            out.append({"norad": norad, "name": info["name"], "kind": kind, "orbit": info["orbit"],
                        "model": info.get("model"),
                        "physics_level": th.get("level") if th.get("available") else None,
                        "nearest": th["items"][0] if th.get("available") and th.get("items") else None})
        return out

    def status(self) -> dict:
        snap = self.snap
        m = next((x for x in self.bundle.get("test_metrics", []) if x.get("model") == "MLP"), {})
        keys = ("macro_f1", "accuracy", "dangerous_called_safe", "auc_danger", "top10_catches", "top30_catches",
                "danger_share")
        out = {"state": self.state, "error": self.error,
               "model": {"trained_at": self.bundle["trained_at"], "features": len(self.features),
                         "n_train": self.bundle.get("n_train"), "n_test": self.bundle.get("n_test"),
                         **{k: m.get(k) for k in keys}},
               "batch": self.batch, "threats": self.threat_job}
        if snap is not None:
            levels = np.bincount([v[0] for v in snap.risk.values()], minlength=4).tolist() if snap.risk else None
            out["catalog"] = {"version": snap.version, "counts": snap.counts,
                              "file_time": _utc(datetime.fromtimestamp(snap.catalog_path.stat().st_mtime,
                                                                       timezone.utc))}
            out["risk"] = {"t0_utc": _utc(snap.risk_t0) if snap.risk_t0 else None,
                           "rated": len(snap.risk), "levels": levels}
        return out
