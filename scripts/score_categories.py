"""
Take raw scraped Amazon data and use Claude to score each category.
Produces the final category_scores.json consumed by the frontend.

Run from project root: python -m scripts.score_categories
"""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
import anthropic

load_dotenv()

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"

SCORE_TOOL = {
    "name": "score_category",
    "description": "Score an Amazon product category for FBA opportunity based on scraped product data.",
    "input_schema": {
        "type": "object",
        "properties": {
            "id": {"type": "string", "description": "Category slug ID"},
            "name": {"type": "string", "description": "Human-readable category name"},
            "parent_category": {"type": "string"},
            "sample_products": {"type": "integer", "description": "Number of products analyzed"},
            "min_viable_budget": {
                "type": "integer",
                "description": "Minimum budget in USD to viably enter this category (order ~30 units + shipping). Round to nearest 500.",
            },
            "avg_price": {"type": "number", "description": "Average product price in USD"},
            "avg_margin_pct": {
                "type": "number",
                "description": "Estimated gross margin % after FBA fees, shipping, COGS. Be realistic — most categories are 25-45%.",
            },
            "scores": {
                "type": "object",
                "properties": {
                    "gross_margin": {"type": "integer", "minimum": 0, "maximum": 100},
                    "demand_satisfaction_gap": {"type": "integer", "minimum": 0, "maximum": 100},
                    "revenue_concentration": {"type": "integer", "minimum": 0, "maximum": 100},
                    "capital_efficiency": {"type": "integer", "minimum": 0, "maximum": 100},
                    "barrier_to_entry": {"type": "integer", "minimum": 0, "maximum": 100},
                    "composite": {"type": "integer", "minimum": 0, "maximum": 100},
                },
                "required": [
                    "gross_margin", "demand_satisfaction_gap", "revenue_concentration",
                    "capital_efficiency", "barrier_to_entry", "composite",
                ],
            },
            "score_explanations": {
                "type": "object",
                "properties": {
                    "gross_margin": {"type": "string"},
                    "demand_satisfaction_gap": {"type": "string"},
                    "revenue_concentration": {"type": "string"},
                    "capital_efficiency": {"type": "string"},
                    "barrier_to_entry": {"type": "string"},
                },
                "required": [
                    "gross_margin", "demand_satisfaction_gap", "revenue_concentration",
                    "capital_efficiency", "barrier_to_entry",
                ],
            },
            "top_products": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "price": {"type": "number"},
                        "rating": {"type": "number"},
                        "reviews_count": {"type": "integer"},
                    },
                    "required": ["name", "price", "rating", "reviews_count"],
                },
                "description": "Top 3-5 products by review count from the scraped data",
            },
        },
        "required": [
            "id", "name", "parent_category", "sample_products", "min_viable_budget",
            "avg_price", "avg_margin_pct", "scores", "score_explanations", "top_products",
        ],
    },
}


def build_prompt(cat_id: str, cat_data: dict) -> str:
    """Build the prompt for Claude to score a category based on real product data."""
    products = cat_data["products"]

    # Summarize the products for the prompt
    product_summaries = []
    for p in products[:30]:  # cap at 30 to stay within context
        if isinstance(p, dict):
            product_summaries.append({
                "name": p.get("name", "Unknown"),
                "price": p.get("price", "N/A"),
                "price_string": p.get("price_string", "N/A"),
                "rating": p.get("stars", "N/A"),
                "reviews": p.get("total_reviews", "N/A"),
                "asin": p.get("asin", ""),
                "is_best_seller": p.get("is_best_seller", False),
                "has_prime": p.get("has_prime", False),
            })

    return f"""Analyze this Amazon product category for FBA (Fulfillment by Amazon) opportunity.

Category: {cat_data.get('parent_category', 'Unknown')} > {cat_id}
Search query used: "{cat_data['query']}"
Total products scraped: {len(products)}

Here are the top products found:

{json.dumps(product_summaries, indent=2)}

Score this category using the score_category tool. Base your analysis on the REAL data above:

- **gross_margin**: Estimate realistic margins after Amazon FBA fees (~30-35% of price), shipping from China (~$3-5/unit), and estimated COGS. Higher score = better margins.
- **demand_satisfaction_gap**: Look at ratings and review complaints implied by lower ratings. If many products have 3.5-4.0 stars, there's room for improvement. Higher score = more opportunity.
- **revenue_concentration**: If a few products dominate (huge review counts vs others), it's harder to compete. Higher score = more distributed market = better for newcomers.
- **capital_efficiency**: Based on avg price and a $2-5K budget, how many units could someone stock? Lower price = more units = lower risk. Higher score = better.
- **barrier_to_entry**: Consider manufacturing complexity, certifications needed, brand dominance. Simple products = higher score.
- **composite**: Weighted average — weight margin and demand gap highest.

Be realistic and conservative. Don't inflate scores. Use the actual prices and ratings from the data."""


def score_category(client: anthropic.Anthropic, cat_id: str, cat_data: dict) -> dict | None:
    """Use Claude to score a single category."""
    prompt = build_prompt(cat_id, cat_data)

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1500,
            tools=[SCORE_TOOL],
            tool_choice={"type": "tool", "name": "score_category"},
            messages=[{"role": "user", "content": prompt}],
        )

        # Extract tool use result
        for block in response.content:
            if block.type == "tool_use":
                return block.input

        print(f"  [warn] No tool_use block in response for {cat_id}")
        return None

    except Exception as e:
        print(f"  [error] Claude API failed for {cat_id}: {e}")
        return None


def main():
    raw_path = DATA_DIR / "raw_scraped.json"
    if not raw_path.exists():
        print("No raw_scraped.json found. Run `python -m scripts.scrape_categories` first.")
        sys.exit(1)

    with open(raw_path, encoding="utf-8") as f:
        raw_data = json.load(f)

    print("=" * 60)
    print("LaunchLens — AI Category Scorer")
    print(f"Scoring {len(raw_data)} categories with Claude")
    print("=" * 60)

    client = anthropic.Anthropic()  # uses ANTHROPIC_API_KEY from env

    scored_categories = []
    for cat_id, cat_data in raw_data.items():
        product_count = len(cat_data.get("products", []))
        if product_count == 0:
            print(f"\n  Skipping {cat_id} — no products scraped")
            continue

        print(f"\n  Scoring {cat_id} ({product_count} products)...")
        result = score_category(client, cat_id, cat_data)

        if result:
            scored_categories.append(result)
            print(f"  -> Composite score: {result['scores']['composite']}")
        else:
            print(f"  -> FAILED")

    # Sort by composite score descending
    scored_categories.sort(key=lambda c: c["scores"]["composite"], reverse=True)

    # Write final output
    output = {
        "generated_at": __import__("datetime").datetime.now().isoformat(),
        "categories": scored_categories,
    }

    out_path = DATA_DIR / "category_scores.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"Done! Scored {len(scored_categories)} categories")
    print(f"Output: {out_path}")
    print(f"{'=' * 60}")

    for c in scored_categories:
        print(f"  {c['scores']['composite']:>3}  {c['name']}")


if __name__ == "__main__":
    main()
