"""
HTTP API сайта. Запуск из корня проекта:

    python3 -m uvicorn server.app:app --port 8000

  GET /api/status               состояние: каталог, модель, пакетная оценка
  GET /api/catalog              все объекты: NORAD, название, тип, TLE (для satellite.js)
  GET /api/objects/{norad}      орбита объекта и оценка риска от MLP

Если собран фронтенд (web/dist), сервер отдаёт и сам сайт — так он и
запускается на хостинге одной командой.
"""
import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, Response

from . import ROOT
from .store import RiskStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
store = RiskStore()
WEB_DIST = ROOT / "web" / "dist"


@asynccontextmanager
async def lifespan(_app):
    # данные грузятся в фоне: сервер сразу отвечает, а сайт ждёт по /api/status
    threading.Thread(target=store.start, daemon=True, name="data").start()
    yield


app = FastAPI(title="Cosmo Orbiz", lifespan=lifespan)


@app.get("/api/status")
def status():
    return store.status()


@app.get("/api/catalog")
def catalog(request: Request):
    snap = store.snap
    if snap is None:
        raise HTTPException(503, "каталог ещё загружается")
    headers = {"Cache-Control": "public, max-age=300", "ETag": f'"{snap.version}"'}
    if request.headers.get("if-none-match") == headers["ETag"]:
        return Response(status_code=304, headers=headers)
    if "gzip" in request.headers.get("accept-encoding", ""):
        headers |= {"Content-Encoding": "gzip", "Vary": "Accept-Encoding"}
        return Response(snap.catalog_gzip, media_type="application/json", headers=headers)
    return Response(snap.catalog_json, media_type="application/json", headers=headers)


@app.get("/api/objects/{norad}")
def object_risk(norad: int):
    if store.snap is None:
        raise HTTPException(503, "каталог ещё загружается")
    out = store.risk(norad)
    if out is None:
        raise HTTPException(404, "объект не найден")
    return out


@app.get("/api/risks")
def risks():
    """Уровни риска всех спутников (нейросеть и точный расчёт) — для раскраски глобуса."""
    if store.snap is None:
        raise HTTPException(503, "каталог ещё загружается")
    return store.risks()


@app.get("/api/stats")
def stats():
    """Группировки и сравнение «нейросеть против физики» на сегодняшних данных."""
    if store.snap is None:
        raise HTTPException(503, "каталог ещё загружается")
    return store.stats()


@app.get("/api/kazakhstan")
def kazakhstan():
    if store.snap is None:
        raise HTTPException(503, "каталог ещё загружается")
    return store.kazakhstan()


@app.get("/{path:path}")
def site(path: str):
    """Собранный фронтенд (web/dist). Проверяется при каждом запросе — после
    npm run build сервер не нужно перезапускать."""
    if path.startswith("api/"):
        raise HTTPException(404, "нет такого метода API")
    if not (WEB_DIST / "index.html").exists():
        raise HTTPException(404, "фронтенд не собран: cd web && npm run build")
    f = (WEB_DIST / path).resolve()
    if path and f.is_file() and WEB_DIST.resolve() in f.parents:
        # файлы в assets/ с хэшем в имени — их можно кэшировать надолго
        cache = "public, max-age=31536000, immutable" if path.startswith("assets/") else "no-cache"
        return FileResponse(f, headers={"Cache-Control": cache})
    return FileResponse(WEB_DIST / "index.html", headers={"Cache-Control": "no-cache"})
