import json
from pathlib import Path
from backend.models.category import CategoryScore, CategoryDetail

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_categories() -> list[CategoryScore]:
    path = DATA_DIR / "category_scores.json"
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    categories = []
    for c in raw["categories"]:
        # Ensure score_explanations values are all strings (Claude sometimes returns ints)
        if "score_explanations" in c:
            c["score_explanations"] = {k: str(v) for k, v in c["score_explanations"].items()}
        categories.append(CategoryScore(**c))
    return categories


def _load_feature_analysis() -> dict[str, CategoryDetail]:
    path = DATA_DIR / "feature_analysis.json"
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    return {
        cat_id: CategoryDetail(**cat_data)
        for cat_id, cat_data in raw["categories"].items()
    }


# Load once at startup
ALL_CATEGORIES: list[CategoryScore] = _load_categories()
ALL_FEATURES: dict[str, CategoryDetail] = _load_feature_analysis()


def get_categories_for_budget(budget: int) -> list[CategoryScore]:
    """Filter by budget, sort by composite score descending."""
    eligible = [c for c in ALL_CATEGORIES if c.min_viable_budget <= budget]
    eligible.sort(key=lambda c: c.scores.composite, reverse=True)
    return eligible


def get_category_detail(category_id: str) -> CategoryDetail | None:
    return ALL_FEATURES.get(category_id)


def get_category_scores(category_id: str) -> CategoryScore | None:
    return next((c for c in ALL_CATEGORIES if c.id == category_id), None)
