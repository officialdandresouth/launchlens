from fastapi import APIRouter, Query
from backend.models.category import CategoriesResponse
from backend.services.data_loader import get_categories_for_budget

router = APIRouter(prefix="/api")


@router.get("/categories", response_model=CategoriesResponse)
def list_categories(budget: int = Query(..., ge=1000, le=25000)):
    cats = get_categories_for_budget(budget)
    return CategoriesResponse(
        budget=budget,
        count=len(cats),
        categories=cats,
    )
