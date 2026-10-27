"""
Cosmo Orbiz — общие настройки проекта.
Все пороги и параметры собраны здесь, чтобы их было легко менять.
"""
from pathlib import Path

# ---------------------------------------------------------------- пути
ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
CATALOG_CSV = DATA_DIR / "catalog.csv"          # объединённый каталог объектов
DATASET_CSV = DATA_DIR / "dataset.csv"          # признаки + метки для обучения
CONJ_CSV = DATA_DIR / "conjunctions.csv.gz"     # найденные сближения (для анализа), сжатый
MODELS_DIR = ROOT / "models"
MODEL_PATH = MODELS_DIR / "orbital_shield_mlp.joblib"
REPORTS_DIR = ROOT / "reports"

# ---------------------------------------------------------------- данные CelesTrak
CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP={group}&FORMAT=csv"
# группа -> тип объекта по умолчанию (None = определить по названию)
CELESTRAK_GROUPS = {
    "active": None,                    # все действующие спутники (CelesTrak может отвечать 403 —
                                       # тогда спутники собираются из групп ниже)
    "cosmos-1408-debris": "DEBRIS",
    "fengyun-1c-debris": "DEBRIS",
    "iridium-33-debris": "DEBRIS",
    "cosmos-2251-debris": "DEBRIS",
}

# Запасной вариант, если «active» не скачалась: группы поменьше со спутниками
CELESTRAK_FALLBACK_GROUPS = [
    "stations", "starlink", "oneweb", "iridium-NEXT", "orbcomm", "globalstar",
    "planet", "spire", "weather", "resource", "science", "geodetic", "engineering",
    "education", "cubesat", "military", "radar", "sarsat", "gnss", "geo", "other-comm",
]

# ---------------------------------------------------------------- поиск сближений
SCREEN_HOURS = 48          # на сколько часов вперёд ищем сближения
SCREEN_STEP_S = 10.0       # шаг по времени, секунды
SCREEN_RADIUS_KM = 5.0     # сближения ближе этого расстояния считаются
MAX_REL_SPEED_KMS = 15.5   # максимальная относительная скорость на НОО
EVENT_GAP_S = 600.0        # сближения одной пары чаще этого — одно событие

# Группировки: спутник (PAYLOAD) относится к группировке по первому слову названия.
# Сближения внутри одной группировки (Starlink–Starlink, модули МКС между собой)
# по TLE выглядят опасными, хотя оператор их координирует (или они вообще состыкованы).
CONSTELLATION_PREFIXES = [
    "STARLINK", "ONEWEB", "KUIPER", "QIANFAN", "GUOWANG", "IRIDIUM", "GLOBALSTAR",
    "ORBCOMM", "FLOCK", "LEMUR", "SKYSAT", "HAWK", "SDA", "TIANMU", "YAOGAN",
    "HULIANWANG", "JILIN", "ICEYE", "GEESAT",
    "ISS", "CSS",
]
# Спутники Казахстана (NORAD -> ключ назначения для текстов сайта).
# Сошедшие с орбиты (по CelesTrak SATCAT): AL-FARABI 1 (2023), KAZSCISAT-1 (2025), AL-FARABI 2 (2026).
KZ_SATELLITES = {
    37749: "comm",       # KAZSAT-2, связь и телевидение, ГСО
    39728: "comm",       # KAZSAT-3
    39731: "eo_high",    # KAZEOSAT 1, съёмка Земли высокого разрешения
    40010: "eo_medium",  # KAZEOSAT 2, съёмка среднего разрешения
    43783: "tech",       # KAZSTSAT, научно-технологический
}

# Состыкованные объекты (корабль у станции): в TLE у них промах и скорость ровно 0.
# Такие пары тоже считаются внутренними, даже если названия разные (SOYUZ у ISS).
DOCKED_MISS_KM = 0.1
DOCKED_VREL_KMS = 0.01
# Учитывать ли внутренние пары (группировка или стыковка) в метке риска.
# False: по label_experiment.py 97.5% сближений — внутренние (почти все Starlink–Starlink),
# и с ними метка измеряет плотность своей группировки, а не внешнюю угрозу.
LABEL_INTRA_GROUP = False

# Как считать вероятность столкновения (см. screening.py):
#   "max"   — худший случай, как в CelesTrak SOCRATES (не нужны ковариации)
#   "sigma" — гауссова ошибка с заданной σ (ниже)
PC_METHOD = "max"

# Неопределённость положения (1 сигма, км): базовая + рост за сутки от эпохи TLE.
# Это упрощение: в реальной практике берут ковариации из CDM.
SIGMA_KM = {               # (база, рост в сутки)
    "PAYLOAD": (0.2, 0.25),
    "ROCKET BODY": (0.3, 0.35),
    "DEBRIS": (0.4, 0.5),
    "UNKNOWN": (0.4, 0.5),
}
# Радиус «жёсткого тела» объекта, метры (для вероятности столкновения)
HARD_BODY_RADIUS_M = {
    "PAYLOAD": 3.0,
    "ROCKET BODY": 4.0,
    "DEBRIS": 0.5,
    "UNKNOWN": 1.0,
}

# ---------------------------------------------------------------- классы риска
# Класс задаётся максимальной вероятностью столкновения (Pc) за окно прогноза.
RISK_LEVELS = ["SAFE", "LOW", "MEDIUM", "HIGH"]
RISK_LEVELS_RU = ["Полностью безопасно", "Низкий", "Средний", "Высокий"]
PC_THRESHOLDS = [1e-7, 1e-5, 1e-4]   # SAFE < 1e-7 <= LOW < 1e-5 <= MEDIUM < 1e-4 <= HIGH

# ---------------------------------------------------------------- признаки
SHELL_MARGINS_KM = [10, 25, 50]       # ширина «слоя» вокруг орбиты спутника
SNAPSHOT_RADII_KM = [50, 200]         # соседи в момент t0
PHASE_MOID_KM = 10.0                  # фазировка: пары с MOID меньше этого
PHASE_ANCHOR_S = 3600.0               # фазировка: точные положения (SGP4) раз в столько секунд
