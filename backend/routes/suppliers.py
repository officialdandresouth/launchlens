import os
import json
from urllib.parse import quote_plus
from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from dotenv import load_dotenv
from backend.models.category import SuppliersRequest, SuppliersResponse, SupplierQuery
from backend.services.data_loader import get_category_scores

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

router = APIRouter(prefix="/api")

SUPPLIER_TOOL = {
    "name": "generate_supplier_queries",
    "description": "Generate Alibaba search queries for sourcing this product",
    "input_schema": {
        "type": "object",
        "properties": {
            "queries": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "search_term": {
                            "type": "string",
                            "description": "The search query to use on Alibaba"
                        },
                        "explanation": {
                            "type": "string",
                            "description": "Why this search term is recommended"
                        },
                        "estimated_moq": {
                            "type": "string",
                            "description": "Typical minimum order quantity (e.g. '100-500 units')"
                        },
                        "estimated_price_range": {
                            "type": "string",
                            "description": "Typical per-unit price range (e.g. '$2.50-$5.00')"
                        }
                    },
                    "required": ["search_term", "explanation", "estimated_moq", "estimated_price_range"]
                },
                "minItems": 3,
                "maxItems": 5
            }
        },
        "required": ["queries"]
    }
}


@router.post("/suppliers", response_model=SuppliersResponse)
def generate_suppliers(req: SuppliersRequest):
    scores = get_category_scores(req.category_id)
    if not scores:
        raise HTTPException(status_code=404, detail=f"Category '{req.category_id}' not found")

    prompt = f"""You are a sourcing expert for Amazon FBA sellers. Generate 3-5 Alibaba search queries to find manufacturers for this product.

CATEGORY: {scores.name}
BUDGET: ${req.budget:,}
PRODUCT SPEC: {req.product_spec_summary}

For each query:
- Use specific manufacturing/wholesale terminology that works well on Alibaba
- Vary the queries: include exact product searches, material-specific searches, and OEM/ODM searches
- Estimate realistic MOQs and price ranges for a first-time buyer
- Keep explanations concise — why this specific search term helps find the right supplier"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        tools=[SUPPLIER_TOOL],
        tool_choice={"type": "tool", "name": "generate_supplier_queries"},
        messages=[{"role": "user", "content": prompt}],
    )

    tool_result = None
    for block in response.content:
        if block.type == "tool_use":
            tool_result = block.input
            break

    if not tool_result:
        raise HTTPException(status_code=500, detail="Failed to generate supplier queries")

    # Build Alibaba URLs from search terms
    queries = []
    for q in tool_result["queries"]:
        queries.append(SupplierQuery(
            search_term=q["search_term"],
            alibaba_url=f"https://www.alibaba.com/trade/search?SearchText={quote_plus(q['search_term'])}",
            explanation=q["explanation"],
            estimated_moq=q["estimated_moq"],
            estimated_price_range=q["estimated_price_range"],
        ))

    return SuppliersResponse(
        category_id=req.category_id,
        queries=queries,
    )
