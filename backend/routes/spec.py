import os
import json
from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from dotenv import load_dotenv
from backend.models.category import SpecRequest, SpecResponse, ProductSpec
from backend.services.data_loader import get_category_detail, get_category_scores

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

router = APIRouter(prefix="/api")

SPEC_TOOL = {
    "name": "generate_product_spec",
    "description": "Generate a manufacturer-ready product specification based on market analysis",
    "input_schema": {
        "type": "object",
        "properties": {
            "product_title": {
                "type": "string",
                "description": "A concise, descriptive title for the ideal product"
            },
            "target_price_min": {
                "type": "number",
                "description": "Minimum recommended selling price in USD"
            },
            "target_price_max": {
                "type": "number",
                "description": "Maximum recommended selling price in USD"
            },
            "target_unit_cost_max": {
                "type": "number",
                "description": "Maximum unit cost from manufacturer in USD to maintain healthy margins"
            },
            "required_features": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "feature": {"type": "string"},
                        "rationale": {"type": "string", "description": "Why this feature is required, citing review data"}
                    },
                    "required": ["feature", "rationale"]
                },
                "description": "Must-have features based on buyer expectations and review analysis"
            },
            "features_to_avoid": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "feature": {"type": "string"},
                        "rationale": {"type": "string", "description": "Why this feature should be avoided"}
                    },
                    "required": ["feature", "rationale"]
                },
                "description": "Features that hurt reviews or add cost without value"
            },
            "key_differentiators": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "differentiator": {"type": "string"},
                        "reasoning": {"type": "string", "description": "Why this sets the product apart"}
                    },
                    "required": ["differentiator", "reasoning"]
                },
                "description": "What will set this product apart from existing competition"
            },
            "ideal_product_description": {
                "type": "string",
                "description": "A 2-3 paragraph narrative describing the ideal product a manufacturer should build"
            },
            "packaging_notes": {
                "type": "string",
                "description": "Packaging recommendations for FBA compliance and brand perception"
            },
            "target_rating": {
                "type": "number",
                "description": "Target average star rating (e.g. 4.5)"
            },
            "estimated_monthly_units": {
                "type": "integer",
                "description": "Estimated monthly unit sales based on market data"
            }
        },
        "required": [
            "product_title", "target_price_min", "target_price_max",
            "target_unit_cost_max", "required_features", "features_to_avoid",
            "key_differentiators", "ideal_product_description",
            "packaging_notes", "target_rating", "estimated_monthly_units"
        ]
    }
}


@router.post("/spec", response_model=SpecResponse)
def generate_spec(req: SpecRequest):
    detail = get_category_detail(req.category_id)
    scores = get_category_scores(req.category_id)

    if not detail or not scores:
        raise HTTPException(status_code=404, detail=f"Category '{req.category_id}' not found")

    # Build context from feature analysis data
    features_text = "\n".join(
        f"- {f.feature_name}: {f.satisfaction_pct}% satisfaction ({f.mention_count} products mention it). {f.insight}"
        for f in detail.features
    )

    opportunities_text = "\n".join(
        f"- [{o.priority} priority] {o.opportunity}: {o.reasoning}"
        for o in detail.opportunities
    ) if detail.opportunities else "No specific opportunities identified."

    products_text = "\n".join(
        f"- {p.name} — ${p.price:.2f}, {p.rating}★, ~{p.reviews_count} reviews, ~${p.estimated_monthly_revenue}/mo"
        for p in detail.top_products[:10]
    ) if detail.top_products else "No product data available."

    market_text = ""
    if detail.market_summary:
        ms = detail.market_summary
        market_text = f"Price range: {ms.price_range}. Avg rating: {ms.avg_rating}. {ms.total_products_analyzed} products analyzed. {ms.market_insight}"

    prompt = f"""You are a product development consultant for Amazon FBA sellers. Based on the market analysis below, generate a manufacturer-ready product specification.

CATEGORY: {detail.category_name}
BUDGET: ${req.budget:,}

MARKET OVERVIEW:
{market_text}

FEATURE SATISFACTION (from buyer reviews):
{features_text}

MARKET OPPORTUNITIES:
{opportunities_text}

TOP COMPETING PRODUCTS:
{products_text}

SCORING:
- Avg margin: {scores.avg_margin_pct:.1f}%
- Avg price: ${scores.avg_price:.2f}

Generate a product spec that a new seller could hand to a manufacturer. Focus on features that buyers actually care about (high mention count + low satisfaction = biggest opportunity). Set realistic price targets that maintain healthy margins. The ideal product description should read like a compelling brief — explain WHAT to build and WHY, citing specific data points from the analysis."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        tools=[SPEC_TOOL],
        tool_choice={"type": "tool", "name": "generate_product_spec"},
        messages=[{"role": "user", "content": prompt}],
    )

    # Extract tool use result
    tool_result = None
    for block in response.content:
        if block.type == "tool_use":
            tool_result = block.input
            break

    if not tool_result:
        raise HTTPException(status_code=500, detail="Failed to generate product spec")

    spec = ProductSpec(**tool_result)

    return SpecResponse(
        category_id=req.category_id,
        category_name=detail.category_name,
        budget=req.budget,
        spec=spec,
    )
