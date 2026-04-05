import os
import json
from datetime import date
from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from dotenv import load_dotenv
from backend.models.category import LaunchPlanRequest, LaunchPlanResponse, Milestone, CommonMistake
from backend.services.data_loader import get_category_scores

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

router = APIRouter(prefix="/api")

LAUNCH_PLAN_TOOL = {
    "name": "generate_launch_plan",
    "description": "Generate a personalized FBA launch timeline with real dates",
    "input_schema": {
        "type": "object",
        "properties": {
            "milestones": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "step_number": {"type": "integer"},
                        "title": {"type": "string"},
                        "target_date": {
                            "type": "string",
                            "description": "ISO date YYYY-MM-DD"
                        },
                        "duration_days": {
                            "type": "integer",
                            "description": "How many days this step takes"
                        },
                        "description": {
                            "type": "string",
                            "description": "What the seller should do during this step"
                        },
                        "cost_estimate": {
                            "type": "string",
                            "description": "Estimated cost for this step (e.g. '$200-$500')"
                        }
                    },
                    "required": ["step_number", "title", "target_date", "duration_days", "description"]
                }
            },
            "common_mistakes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "mistake": {"type": "string"},
                        "how_to_avoid": {"type": "string"}
                    },
                    "required": ["mistake", "how_to_avoid"]
                }
            },
            "total_timeline_weeks": {
                "type": "integer",
                "description": "Total weeks from start to launch"
            }
        },
        "required": ["milestones", "common_mistakes", "total_timeline_weeks"]
    }
}


@router.post("/launch-plan", response_model=LaunchPlanResponse)
def generate_launch_plan(req: LaunchPlanRequest):
    scores = get_category_scores(req.category_id)
    if not scores:
        raise HTTPException(status_code=404, detail=f"Category '{req.category_id}' not found")

    today = date.today().isoformat()

    prompt = f"""You are an Amazon FBA launch strategist. Create a personalized launch timeline for a first-time seller.

TODAY'S DATE: {today}
CATEGORY: {scores.name}
BUDGET: ${req.budget:,}
PRODUCT SPEC: {req.product_spec_summary}

Generate a step-by-step launch plan with:
1. Real dates starting from today (all target_date fields must be YYYY-MM-DD format)
2. Milestones covering: supplier research, sample ordering, bulk ordering, manufacturing, shipping/freight, Amazon listing creation, inventory check-in, PPC campaign launch, review generation strategy
3. Realistic durations for each step (manufacturing takes 15-30 days, ocean freight 25-40 days, etc.)
4. Cost estimates where applicable, scaled to the seller's ${req.budget:,} budget
5. 4-6 common first-seller mistakes specific to this category

Be realistic — a first-time seller with ${req.budget:,} should be conservative. Include buffer time for delays."""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        tools=[LAUNCH_PLAN_TOOL],
        tool_choice={"type": "tool", "name": "generate_launch_plan"},
        messages=[{"role": "user", "content": prompt}],
    )

    tool_result = None
    for block in response.content:
        if block.type == "tool_use":
            tool_result = block.input
            break

    if not tool_result:
        raise HTTPException(status_code=500, detail="Failed to generate launch plan")

    milestones = [Milestone(**m) for m in tool_result["milestones"]]
    mistakes = [CommonMistake(**m) for m in tool_result["common_mistakes"]]

    return LaunchPlanResponse(
        category_id=req.category_id,
        category_name=scores.name,
        budget=req.budget,
        milestones=milestones,
        common_mistakes=mistakes,
        total_timeline_weeks=tool_result["total_timeline_weeks"],
    )
