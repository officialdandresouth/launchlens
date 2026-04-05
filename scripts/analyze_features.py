"""
Analyze product features per category using Claude Haiku.
Reads raw_scraped.json, extracts features from product names + ratings,
and produces feature_analysis.json for the deep dive screen.

Run from project root: python -m scripts.analyze_features

Options:
  --only id1,id2,...   Only analyze these category IDs (merge with existing analysis)
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
import anthropic

load_dotenv()

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"

FEATURE_TOOL = {
    "name": "analyze_category_features",
    "description": "Extract product features and estimate satisfaction levels from Amazon product data for a category.",
    "input_schema": {
        "type": "object",
        "properties": {
            "category_id": {"type": "string"},
            "category_name": {"type": "string"},
            "features": {
                "type": "array",
                "description": "5-8 key product features extracted from product names",
                "items": {
                    "type": "object",
                    "properties": {
                        "feature_name": {
                            "type": "string",
                            "description": "Short feature label, e.g., 'Non-Slip Surface', 'Eco-Friendly Material'",
                        },
                        "mention_count": {
                            "type": "integer",
                            "description": "How many products mention or advertise this feature",
                        },
                        "satisfaction_pct": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "Estimated satisfaction % based on avg rating of products with this feature",
                        },
                        "avg_rating_with_feature": {
                            "type": "number",
                            "description": "Average star rating of products that advertise this feature",
                        },
                        "insight": {
                            "type": "string",
                            "description": "1-sentence explanation of what this feature data tells a new seller",
                        },
                    },
                    "required": [
                        "feature_name",
                        "mention_count",
                        "satisfaction_pct",
                        "avg_rating_with_feature",
                        "insight",
                    ],
                },
            },
            "opportunities": {
                "type": "array",
                "description": "2-4 underserved features or gaps for new sellers",
                "items": {
                    "type": "object",
                    "properties": {
                        "opportunity": {"type": "string"},
                        "reasoning": {
                            "type": "string",
                            "description": "1-2 sentence explanation",
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["high", "medium", "low"],
                        },
                    },
                    "required": ["opportunity", "reasoning", "priority"],
                },
            },
            "top_products": {
                "type": "array",
                "description": "Top 10 products sorted by estimated revenue (reviews * price as proxy)",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "asin": {"type": "string"},
                        "price": {"type": "number"},
                        "rating": {"type": "number"},
                        "reviews_count": {"type": "integer"},
                        "estimated_monthly_revenue": {
                            "type": "integer",
                            "description": "Rough estimate using review velocity * price as proxy",
                        },
                        "key_features": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "2-4 features this product advertises",
                        },
                    },
                    "required": [
                        "name",
                        "asin",
                        "price",
                        "rating",
                        "reviews_count",
                        "estimated_monthly_revenue",
                        "key_features",
                    ],
                },
            },
            "market_summary": {
                "type": "object",
                "properties": {
                    "price_range": {"type": "string", "description": "e.g., '$8.99 - $45.99'"},
                    "avg_rating": {"type": "number"},
                    "total_products_analyzed": {"type": "integer"},
                    "market_insight": {
                        "type": "string",
                        "description": "2-3 sentence summary of the competitive landscape",
                    },
                },
                "required": [
                    "price_range",
                    "avg_rating",
                    "total_products_analyzed",
                    "market_insight",
                ],
            },
        },
        "required": [
            "category_id",
            "category_name",
            "features",
            "opportunities",
            "top_products",
            "market_summary",
        ],
    },
}


def build_feature_prompt(cat_id: str, cat_data: dict) -> str:
    """Build prompt with product names, prices, ratings for Claude to extract features."""
    products = cat_data["products"]

    product_summaries = []
    for p in products[:40]:
        if not isinstance(p, dict):
            continue
        price = p.get("price")
        stars = p.get("stars")
        if price is None or stars is None:
            continue
        product_summaries.append({
            "name": p.get("name", "Unknown"),
            "asin": p.get("asin", ""),
            "price": price,
            "rating": stars,
            "reviews": p.get("total_reviews", 0),
            "is_best_seller": p.get("is_best_seller", False),
        })

    return f"""Analyze this Amazon product category to extract KEY FEATURES that sellers advertise and buyers care about.

Category: {cat_data.get('parent_category', 'Unknown')} > {cat_id}
Search query: "{cat_data['query']}"
Total products: {len(products)}

Product data (up to 40 products):

{json.dumps(product_summaries, indent=2)}

Instructions:
1. PARSE PRODUCT NAMES carefully. Amazon sellers pack keywords into titles — "Non-Slip", "BPA-Free", "Extra Thick", "Eco-Friendly", "Adjustable", etc. These ARE the features.
2. GROUP products by shared features. Count how many products mention each feature.
3. For each feature, calculate the AVERAGE STAR RATING of products advertising it. Convert to a satisfaction percentage (4.0 stars = ~80%, 4.5 = ~90%, 3.5 = ~70%).
4. IDENTIFY OPPORTUNITIES: features rarely mentioned (underserved niches) or features where products score poorly (room for improvement).
5. RANK top 10 products by estimated monthly revenue. Use (total_reviews / 24) * price as a rough proxy — assumes reviews accumulate over ~2 years.

Use the analyze_category_features tool to return your structured analysis."""


def analyze_category(client: anthropic.Anthropic, cat_id: str, cat_data: dict) -> dict | None:
    """Call Claude Haiku to analyze one category's features."""
    prompt = build_feature_prompt(cat_id, cat_data)

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2500,
            tools=[FEATURE_TOOL],
            tool_choice={"type": "tool", "name": "analyze_category_features"},
            messages=[{"role": "user", "content": prompt}],
        )

        for block in response.content:
            if block.type == "tool_use":
                return block.input

        print(f"  [warn] No tool_use block for {cat_id}")
        return None

    except Exception as e:
        print(f"  [error] Claude API failed for {cat_id}: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="LaunchLens — AI Feature Analyzer")
    parser.add_argument(
        "--only",
        type=str,
        default=None,
        help="Comma-separated category IDs to analyze (merges with existing analysis)",
    )
    args = parser.parse_args()

    only_ids = set(s.strip() for s in args.only.split(",")) if args.only else None

    raw_path = DATA_DIR / "raw_scraped.json"
    if not raw_path.exists():
        print("No raw_scraped.json found. Run `python -m scripts.scrape_categories` first.")
        sys.exit(1)

    with open(raw_path, encoding="utf-8") as f:
        raw_data = json.load(f)

    # Filter to only requested categories if --only is set
    if only_ids:
        raw_data = {k: v for k, v in raw_data.items() if k in only_ids}

    print("=" * 60)
    print("LaunchLens — AI Feature Analyzer")
    print(f"Analyzing {len(raw_data)} categories with Claude")
    if only_ids:
        print(f"  Filtering to: {sorted(only_ids)}")
    print("=" * 60)

    client = anthropic.Anthropic()

    results = {}
    for cat_id, cat_data in raw_data.items():
        product_count = len(cat_data.get("products", []))
        if product_count == 0:
            print(f"\n  Skipping {cat_id} — no products")
            continue

        print(f"\n  Analyzing {cat_id} ({product_count} products)...")
        result = analyze_category(client, cat_id, cat_data)

        if result:
            results[cat_id] = result
            feat_count = len(result.get("features", []))
            opp_count = len(result.get("opportunities", []))
            print(f"  -> {feat_count} features, {opp_count} opportunities")
        else:
            print(f"  -> FAILED")

    # Merge with existing analysis if --only was used
    if only_ids:
        analysis_path = DATA_DIR / "feature_analysis.json"
        if analysis_path.exists():
            with open(analysis_path, encoding="utf-8") as f:
                existing = json.load(f)
            existing_categories = existing.get("categories", {})
            existing_categories.update(results)  # new overwrites matching keys
            results = existing_categories
            print(f"\nMerged with existing analysis ({len(existing_categories)} total categories)")

    output = {
        "generated_at": __import__("datetime").datetime.now().isoformat(),
        "categories": results,
    }

    out_path = DATA_DIR / "feature_analysis.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"Done! Analyzed {len(results)} categories")
    print(f"Output: {out_path}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
