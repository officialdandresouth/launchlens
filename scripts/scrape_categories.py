"""
Scrape Amazon product data for all target categories and save raw results.
Run from project root: python -m scripts.scrape_categories

Options:
  --only id1,id2,...   Only scrape these category IDs (comma-separated)
  --append             Merge new data into existing raw_scraped.json instead of overwriting
"""

import argparse
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.services.scraper import scrape_all_categories, CATEGORY_SEARCHES

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    parser = argparse.ArgumentParser(description="LaunchLens — Amazon Category Scraper")
    parser.add_argument(
        "--only",
        type=str,
        default=None,
        help="Comma-separated category IDs to scrape (default: all)",
    )
    parser.add_argument(
        "--append",
        action="store_true",
        help="Merge new data into existing raw_scraped.json instead of overwriting",
    )
    args = parser.parse_args()

    only_ids = [s.strip() for s in args.only.split(",")] if args.only else None
    target_count = len(only_ids) if only_ids else len(CATEGORY_SEARCHES)

    print("=" * 60)
    print("LaunchLens — Amazon Category Scraper")
    print(f"Scraping {target_count} categories, 2 pages each")
    if only_ids:
        print(f"  Filtering to: {only_ids}")
    if args.append:
        print("  Mode: append (merging with existing data)")
    print("=" * 60)

    raw_data = scrape_all_categories(pages_per_category=2, delay=2.0, only_ids=only_ids)

    # Merge with existing data if --append
    raw_path = OUTPUT_DIR / "raw_scraped.json"
    if args.append and raw_path.exists():
        with open(raw_path, encoding="utf-8") as f:
            existing = json.load(f)
        print(f"\nMerging with {len(existing)} existing categories...")
        existing.update(raw_data)  # new data overwrites matching keys
        raw_data = existing

    # Save raw scraped data
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
