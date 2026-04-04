from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    gross_margin: int
    demand_satisfaction_gap: int
    revenue_concentration: int
    capital_efficiency: int
    barrier_to_entry: int
    composite: int


class TopProduct(BaseModel):
    name: str
    price: float
    rating: float
    reviews_count: int


class CategoryScore(BaseModel):
    id: str
    name: str
    parent_category: str
    sample_products: int
    min_viable_budget: int
    avg_price: float
    avg_margin_pct: float
    scores: ScoreBreakdown
    score_explanations: dict[str, str]
    top_products: list[TopProduct]


class CategoriesResponse(BaseModel):
    budget: int
    count: int
    categories: list[CategoryScore]
