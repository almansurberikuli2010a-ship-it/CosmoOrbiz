"""
Шаг 1. Загрузка каталога объектов на орбите.

Скачивает орбитальные элементы (формат OMM/CSV) с CelesTrak:
действующие спутники + несколько крупных облаков космического мусора.
Результат: data/catalog.csv — одна строка на объект.

Запуск:
    python data_download.py                 # скачать (кэш 2 часа)
    python data_download.py --force         # скачать заново
    python data_download.py --spacetrack my_gp.csv   # добавить полный каталог Space-Track

CelesTrak просит не скачивать одну и ту же группу чаще раза в 2 часа,
поэтому файлы кэшируются в data/raw/.
"""
import argparse
import sys
import time
import urllib.request

import pandas as pd

import config


def guess_type(name: str) -> str:
    """Определяем тип объекта по названию (у CelesTrak нет поля OBJECT_TYPE)."""
    n = (name or "").upper()
    if " DEB" in n or n.endswith("DEB") or "DEBRIS" in n:
        return "DEBRIS"
    if "R/B" in n or "ROCKET" in n:
        return "ROCKET BODY"
    return "PAYLOAD"


def normalize_type(t: str) -> str:
    t = (t or "").strip().upper()
    if t in ("PAYLOAD", "ROCKET BODY", "DEBRIS"):
        return t
    return "UNKNOWN"


def _fetch(url: str, timeout: int, tries: int) -> bytes:
    """Скачать URL с несколькими попытками. Группа active — это ~15 тыс.
    объектов (несколько МБ), на медленном интернете ей нужно больше времени."""
    last = None
    for k in range(1, tries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OrbitalShield/0.2 (student project)"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            last = e
            # 403/404 — сервер отказал или группы нет: повторять бессмысленно
            if getattr(e, "code", None) in (403, 404):
                break
            if k < tries:
                print(f"\n    попытка {k} не удалась ({e}), повтор через {5 * k} с ...", end=" ", flush=True)
                time.sleep(5 * k)
    raise last


def download_group(group: str, force: bool, timeout: int = 180, tries: int = 3) -> pd.DataFrame | None:
    config.RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = config.RAW_DIR / f"{group}.csv"
    fresh = path.exists() and (time.time() - path.stat().st_mtime) < 2 * 3600
    if force or not fresh:
        url = config.CELESTRAK_URL.format(group=group)
        print(f"  скачиваю {group} ...", end=" ", flush=True)
        try:
            data = _fetch(url, timeout, tries)
            if not data.lstrip().startswith(b"OBJECT_NAME"):
                # CelesTrak отвечает текстом, а не CSV: неверная группа, лимит запросов,
                # «данные не обновлялись с прошлой загрузки» и т.п.
                msg = data[:300].decode(errors="replace").strip().replace("\n", " ")
                raise ValueError(f"CelesTrak ответил не CSV: «{msg}»")
            path.write_bytes(data)
            n_obj = data.count(b"\n") - 1
            print(f"ok ({n_obj} объектов)")
        except Exception as e:  # сеть, лимиты CelesTrak и т.п.
            print(f"ОШИБКА: {e}")
            if not path.exists():
                return None
            print(f"  использую старый файл {path.name}")
    else:
        print(f"  {group}: взят из кэша")
    return pd.read_csv(path, dtype=str)


def add_group(frames, group, default_type, force):
    df = download_group(group, force)
    if df is None or df.empty:
        return False
    df["OBJECT_TYPE"] = default_type or df["OBJECT_NAME"].map(guess_type)
    df["SOURCE_GROUP"] = group
    frames.append(df)
    return True


def build_catalog(force=False, spacetrack=None, out_path=None):
    """Скачать группы и сохранить объединённый каталог в out_path (по умолчанию config.CATALOG_CSV).

    Сайт (server/) сохраняет свой каталог отдельно, чтобы свежие загрузки
    не меняли каталог, на котором собран датасет для обучения.
    """
    out_path = out_path or config.CATALOG_CSV
    frames = []
    ok = {g: add_group(frames, g, t, force) for g, t in config.CELESTRAK_GROUPS.items()}

    # Главная группа со спутниками не скачалась — собираем спутники из групп поменьше
    if not ok.get("active", True):
        print("\nГруппа active не скачалась. Пробую набор небольших групп со спутниками:")
        got = sum(add_group(frames, g, None, force) for g in config.CELESTRAK_FALLBACK_GROUPS)
        print(f"  получено групп: {got} из {len(config.CELESTRAK_FALLBACK_GROUPS)}")

    if spacetrack:
        st = pd.read_csv(spacetrack, dtype=str)
        st["OBJECT_TYPE"] = st.get("OBJECT_TYPE", st["OBJECT_NAME"].map(guess_type)).map(normalize_type)
        st["SOURCE_GROUP"] = "spacetrack"
        frames.append(st)

    if not frames:
        raise RuntimeError("Не удалось получить ни одной группы. Проверь интернет или запусти "
                           "python make_synthetic_catalog.py для офлайн-теста.")

    cat = pd.concat(frames, ignore_index=True)
    cat = cat.drop_duplicates(subset="NORAD_CAT_ID", keep="first")
    n_payload = int((cat["OBJECT_TYPE"] == "PAYLOAD").sum())
    if n_payload == 0:
        raise RuntimeError("\nВ каталоге нет ни одного спутника (PAYLOAD) — только мусор, "
                           "так обучать модель нельзя. Каталог НЕ сохранён.\n"
                           "Что делать: посмотри ошибку для группы active выше и запусти скрипт ещё раз "
                           "через несколько минут (python3 data_download.py --force). "
                           "Если CelesTrak пишет о лимите — подожди 2 часа.")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cat.to_csv(out_path, index=False)

    print(f"\nКаталог: {len(cat)} объектов -> {out_path}")
    print(cat["OBJECT_TYPE"].value_counts().to_string())
    return cat


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="скачать заново, игнорируя кэш")
    ap.add_argument("--spacetrack", help="CSV из Space-Track (класс gp), добавляется к каталогу")
    args = ap.parse_args()
    try:
        build_catalog(args.force, args.spacetrack)
    except RuntimeError as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
