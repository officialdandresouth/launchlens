import json
from pathlib import Path
from backend.models.category import CategoryScore

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_categories() -> list[CategoryScore]:
    path = DATA_DIR / "category_scores.json"
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    return [CategoryScore(**c) for c in raw["categories"]]


# Load once at startup
ALL_CATEGORIES: list[CategoryScore] = _load_categories()


def get_categories_for_budget(budget: int) -> list[CategoryScore]:
    """Filter by budget, sort by composite score descending."""
    eligible = [c for c in ALL_CATEGORIES if c.min_viable_budget <= budget]
    eligible.sort(key=lambda c: c.scores.composite, reverse=True)
    return eligible
