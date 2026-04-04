"""
Scrape Amazon product data for all target categories and save raw results.
Run from project root: python -m scripts.scrape_categories
"""

import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.services.scraper import scrape_all_categories, CATEGORY_SEARCHES

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    print("=" * 60)
    print("LaunchLens — Amazon Category Scraper")
    print(f"Scraping {len(CATEGORY_SEARCHES)} categories, 2 pages each")
    print("=" * 60)

    raw_data = scrape_all_categories(pages_per_category=2, delay=2.0)

    # Save raw scraped data
    raw_path = OUTPUT_DIR / "raw_scraped.json"
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(raw_data, f, indent=2, default=str)

    print(f"\nRaw data saved to {raw_path}")

    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    total = 0
    for cat_id, cat_data in raw_data.items():
        count = len(cat_data["products"])
        total += count
        print(f"  {cat_id}: {count} products")
    print(f"\n  TOTAL: {total} products across {len(raw_data)} categories")
    print("\nNext step: run `python -m scripts.score_categories` to generate AI scores")


if __name__ == "__main__":
    main()
