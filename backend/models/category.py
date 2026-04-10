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
    top_products: list[TopProduct] = []


class CategoriesResponse(BaseModel):
    budget: int
    count: int
    categories: list[CategoryScore]


# --- Deep Dive (Screen 3) models ---

class FeatureAnalysis(BaseModel):
    feature_name: str
    mention_count: int
    satisfaction_pct: int
    avg_rating_with_feature: float
    insight: str


class Opportunity(BaseModel):
    opportunity: str
    reasoning: str
    priority: str


class DetailProduct(BaseModel):
    name: str
    asin: str
    price: float
    rating: float
    reviews_count: int
    estimated_monthly_revenue: int
    key_features: list[str]


class MarketSummary(BaseModel):
    price_range: str
    avg_rating: float
    total_products_analyzed: int
    market_insight: str


class CategoryDetail(BaseModel):
    category_id: str
    category_name: str
    features: list[FeatureAnalysis]
    opportunities: list[Opportunity] = []
    top_products: list[DetailProduct] = []
    market_summary: MarketSummary | None = None


class CategoryDetailResponse(BaseModel):
    budget: int
    category: CategoryDetail
    scores: ScoreBreakdown
    score_explanations: dict[str, str]


# --- Product Spec (Screen 4) models ---

class SpecRequest(BaseModel):
    category_id: str
    budget: int

class RequiredFeature(BaseModel):
    feature: str
    rationale: str

class FeatureToAvoid(BaseModel):
    feature: str
    rationale: str

class KeyDifferentiator(BaseModel):
    differentiator: str
    reasoning: str

class ProductSpec(BaseModel):
    product_title: str
    target_price_min: float
    target_price_max: float
    target_unit_cost_max: float
    required_features: list[RequiredFeature]
    features_to_avoid: list[FeatureToAvoid] = []
    key_differentiators: list[KeyDifferentiator] = []
    ideal_product_description: str = ""
    packaging_notes: str = ""
    target_rating: float = 4.5
    estimated_monthly_units: int = 0

class SpecResponse(BaseModel):
    category_id: str
    category_name: str
    budget: int
    spec: ProductSpec


# --- Suppliers (Screen 6) models ---

class SuppliersRequest(BaseModel):
    category_id: str
    budget: int
    product_spec_summary: str

class SupplierQuery(BaseModel):
    search_term: str
    alibaba_url: str
    explanation: str
    estimated_moq: str
    estimated_price_range: str

class SuppliersResponse(BaseModel):
    category_id: str
    queries: list[SupplierQuery]


# --- Launch Plan (Screen 7) models ---

class LaunchPlanRequest(BaseModel):
    category_id: str
    budget: int
    product_spec_summary: str = ""

class Milestone(BaseModel):
    step_number: int
    title: str
    target_date: str
    duration_days: int
    description: str
    cost_estimate: str | None = None

class CommonMistake(BaseModel):
    mistake: str
    how_to_avoid: str

class LaunchPlanResponse(BaseModel):
    category_id: str
    category_name: str
    budget: int
    milestones: list[Milestone]
    common_mistakes: list[CommonMistake]
    total_timeline_weeks: int
