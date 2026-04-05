from fastapi import APIRouter, HTTPException, Query
from backend.models.category import CategoryDetailResponse
from backend.services.data_loader import get_category_detail, get_category_scores

router = APIRouter(prefix="/api")


@router.get("/category/{category_id}", response_model=CategoryDetailResponse)
def get_category(category_id: str, budget: int = Query(..., ge=1000, le=25000)):
    detail = get_category_detail(category_id)
    scores_obj = get_category_scores(category_id)

    if not detail or not scores_obj:
        raise HTTPException(status_code=404, detail=f"Category '{category_id}' not found")

    if scores_obj.min_viable_budget > budget:
        raise HTTPException(status_code=400, detail="Budget too low for this category")

    return CategoryDetailResponse(
        budget=budget,
        category=detail,
        scores=scores_obj.scores,
        score_explanations=scores_obj.score_explanations,
    )
