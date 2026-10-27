"""Бэкенд сайта Cosmo Orbiz (FastAPI). Запуск из корня проекта:

    python3 -m uvicorn server.app:app --port 8000
"""
import sys
from pathlib import Path

# модули проекта (config, features, propagator ...) лежат в корне
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
