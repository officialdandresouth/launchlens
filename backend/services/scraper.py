"""
ScraperAPI integration — pulls real Amazon product data for given search terms.
Uses ScraperAPI's structured Amazon endpoints for reliable parsing.
"""

import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("SCRAPER_API_KEY")
BASE_URL = "https://api.scraperapi.com"

# Target categories with search queries that map to FBA-friendly niches
CATEGORY_SEARCHES = [
    {"id": "home-kitchen-organizers", "query": "kitchen drawer organizer", "parent": "Home & Kitchen"},
    {"id": "pet-supplies-dog-toys", "query": "dog chew puzzle toy", "parent": "Pet Supplies"},
    {"id": "fitness-resistance-bands", "query": "resistance bands set workout", "parent": "Sports & Outdoors"},
    {"id": "office-desk-accessories", "query": "desk organizer office accessories", "parent": "Office Products"},
    {"id": "baby-teething-toys", "query": "baby teething toys silicone", "parent": "Baby"},
    {"id": "car-phone-mounts", "query": "car phone mount holder", "parent": "Automotive"},
    {"id": "kitchen-silicone-utensils", "query": "silicone kitchen utensil set", "parent": "Home & Kitchen"},
    {"id": "travel-packing-cubes", "query": "packing cubes travel organizer", "parent": "Clothing & Accessories"},
    {"id": "led-strip-lights", "query": "led strip lights bedroom", "parent": "Tools & Home Improvement"},
    {"id": "yoga-mats", "query": "yoga mat non slip thick", "parent": "Sports & Outdoors"},
    {"id": "phone-cases-iphone", "query": "iphone 15 case protective", "parent": "Cell Phones & Accessories"},
    {"id": "reusable-water-bottles", "query": "insulated water bottle stainless steel", "parent": "Sports & Outdoors"},
]


def scrape_amazon_search(query: str, page: int = 1) -> dict | None:
    """
    Hit ScraperAPI's Amazon structured search endpoint.
    Returns parsed JSON with product listings.
    """
    params = {
        "api_key": API_KEY,
        "url": f"https://www.amazon.com/s?k={requests.utils.quote(query)}&page={page}",
        "country_code": "us",
    }

    try:
        resp = requests.get(BASE_URL, params=params, timeout=60)
        resp.raise_for_status()
        return resp.text  # raw HTML — we'll parse it
    except requests.RequestException as e:
        print(f"[scraper] Error fetching '{query}' page {page}: {e}")
        return None


def scrape_amazon_structured(query: str, page: int = 1) -> dict | None:
    """
    Use ScraperAPI's autoparse for Amazon search results.
    Returns structured JSON directly.
    """
    params = {
        "api_key": API_KEY,
        "url": f"https://www.amazon.com/s?k={requests.utils.quote(query)}&page={page}",
        "autoparse": "true",
        "country_code": "us",
    }

    try:
        resp = requests.get(BASE_URL, params=params, timeout=90)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[scraper] Error fetching '{query}' page {page}: {e}")
        return None
    except ValueError:
        print(f"[scraper] Non-JSON response for '{query}' page {page}")
        return None


def scrape_product_page(asin: str) -> dict | None:
    """
    Scrape a single Amazon product detail page by ASIN.
    Returns structured JSON with reviews, price, features, etc.
    """
    params = {
        "api_key": API_KEY,
        "url": f"https://www.amazon.com/dp/{asin}",
        "autoparse": "true",
        "country_code": "us",
    }

    try:
        resp = requests.get(BASE_URL, params=params, timeout=90)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[scraper] Error fetching ASIN {asin}: {e}")
        return None
    except ValueError:
        print(f"[scraper] Non-JSON response for ASIN {asin}")
        return None


def scrape_all_categories(pages_per_category: int = 2, delay: float = 2.0) -> dict:
    """
    Scrape product listings for every category in CATEGORY_SEARCHES.
    Returns a dict keyed by category id, each containing a list of products.
    """
    results = {}

    for cat in CATEGORY_SEARCHES:
        cat_id = cat["id"]
        query = cat["query"]
        print(f"\n[scraper] Scraping '{cat['name'] if 'name' in cat else cat_id}' — query: '{query}'")

        all_products = []
        for page in range(1, pages_per_category + 1):
            print(f"  Page {page}...")
            data = scrape_amazon_structured(query, page=page)

            if data and isinstance(data, dict) and "results" in data:
                products = data["results"]
                all_products.extend(products)
                print(f"  Got {len(products)} results")
            elif data and isinstance(data, list):
                all_products.extend(data)
                print(f"  Got {len(data)} results")
            else:
                print(f"  No parseable results (keys: {list(data.keys()) if isinstance(data, dict) else 'not a dict'})")

            time.sleep(delay)  # respect rate limits

        results[cat_id] = {
            "id": cat_id,
            "query": query,
            "parent_category": cat["parent"],
            "products": all_products,
        }
        print(f"  Total for {cat_id}: {len(all_products)} products")

    return results
