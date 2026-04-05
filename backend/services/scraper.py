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
# Organized by investment tier for clarity
CATEGORY_SEARCHES = [
    # ── Tier 1: $1K–$2K (low-cost, lightweight, simple) ──────────────────
    {"id": "home-kitchen-organizers", "query": "kitchen drawer organizer", "parent": "Home & Kitchen"},
    {"id": "fitness-resistance-bands", "query": "resistance bands set workout", "parent": "Sports & Outdoors"},
    {"id": "office-desk-accessories", "query": "desk organizer office accessories", "parent": "Office Products"},
    {"id": "cable-organizers", "query": "cable organizer management", "parent": "Electronics Accessories"},
    {"id": "travel-packing-cubes", "query": "packing cubes travel organizer", "parent": "Clothing & Accessories"},
    {"id": "led-strip-lights", "query": "led strip lights bedroom", "parent": "Tools & Home Improvement"},
    {"id": "makeup-brush-sets", "query": "makeup brush set professional", "parent": "Beauty & Personal Care"},
    {"id": "hair-accessories-clips", "query": "hair claw clips women", "parent": "Beauty & Personal Care"},
    {"id": "stickers-scrapbooking", "query": "vinyl stickers laptop waterproof", "parent": "Arts & Crafts"},
    {"id": "phone-screen-protectors", "query": "iphone 15 screen protector tempered glass", "parent": "Cell Phones & Accessories"},
    {"id": "kitchen-sponges-scrubbers", "query": "kitchen sponge scrubber non-scratch", "parent": "Home & Kitchen"},
    {"id": "closet-organizer-dividers", "query": "closet shelf dividers organizer", "parent": "Home & Kitchen"},
    {"id": "nail-art-supplies", "query": "nail art stickers gel strips", "parent": "Beauty & Personal Care"},
    {"id": "reusable-produce-bags", "query": "reusable mesh produce bags grocery", "parent": "Home & Kitchen"},
    {"id": "desk-cable-clips", "query": "adhesive cable clips cord organizer desk", "parent": "Electronics Accessories"},
    {"id": "car-air-fresheners", "query": "car air freshener vent clip", "parent": "Automotive"},
    {"id": "bookmarks-reading-accessories", "query": "magnetic bookmarks cute book", "parent": "Office Products"},
    {"id": "silicone-ice-cube-trays", "query": "silicone ice cube tray large", "parent": "Home & Kitchen"},
    {"id": "key-tags-covers", "query": "airtag case holder keychain", "parent": "Electronics Accessories"},

    # ── Tier 2: $2K–$5K (moderate cost, mid-weight) ──────────────────────
    {"id": "pet-supplies-dog-toys", "query": "dog chew puzzle toy", "parent": "Pet Supplies"},
    {"id": "baby-teething-toys", "query": "baby teething toys silicone", "parent": "Baby"},
    {"id": "car-phone-mounts", "query": "car phone mount holder", "parent": "Automotive"},
    {"id": "kitchen-silicone-utensils", "query": "silicone kitchen utensil set", "parent": "Home & Kitchen"},
    {"id": "phone-cases-iphone", "query": "iphone 15 case protective", "parent": "Cell Phones & Accessories"},
    {"id": "reusable-food-storage-bags", "query": "reusable food storage bags silicone", "parent": "Grocery & Kitchen"},
    {"id": "yoga-mats", "query": "yoga mat non slip thick", "parent": "Sports & Outdoors"},
    {"id": "reusable-water-bottles", "query": "insulated water bottle stainless steel", "parent": "Sports & Outdoors"},
    {"id": "dish-drying-racks", "query": "dish drying rack kitchen counter", "parent": "Home & Kitchen"},
    {"id": "garden-tools-hand", "query": "garden hand tool set", "parent": "Patio, Lawn & Garden"},
    {"id": "bamboo-cutting-boards", "query": "bamboo cutting board set kitchen", "parent": "Home & Kitchen"},
    {"id": "essential-oil-diffusers", "query": "essential oil diffuser aromatherapy", "parent": "Health & Household"},
    {"id": "portable-blender-cups", "query": "portable blender personal smoothie", "parent": "Home & Kitchen"},
    {"id": "shower-caddy-organizers", "query": "shower caddy hanging organizer", "parent": "Home & Kitchen"},
    {"id": "pet-grooming-brushes", "query": "dog grooming brush deshedding", "parent": "Pet Supplies"},
    {"id": "mens-grooming-kits", "query": "beard grooming kit men", "parent": "Beauty & Personal Care"},
    {"id": "kids-water-bottles", "query": "kids water bottle school leak proof", "parent": "Baby"},
    {"id": "lunch-boxes-bento", "query": "bento box lunch container adult", "parent": "Home & Kitchen"},
    {"id": "camping-utensils", "query": "camping utensil set portable", "parent": "Sports & Outdoors"},
    {"id": "wall-hooks-adhesive", "query": "adhesive wall hooks heavy duty", "parent": "Home & Kitchen"},
    {"id": "pet-beds-small", "query": "small dog bed washable", "parent": "Pet Supplies"},
    {"id": "wireless-earbuds-budget", "query": "wireless earbuds bluetooth budget", "parent": "Electronics"},
    {"id": "fanny-packs-belt-bags", "query": "fanny pack belt bag crossbody", "parent": "Clothing & Accessories"},
    {"id": "art-markers-pens", "query": "dual tip art markers brush pen", "parent": "Arts & Crafts"},
    {"id": "first-aid-kits", "query": "first aid kit travel compact", "parent": "Health & Household"},
    {"id": "spice-rack-organizers", "query": "spice rack organizer cabinet", "parent": "Home & Kitchen"},
    {"id": "sunglasses-polarized", "query": "polarized sunglasses men women", "parent": "Clothing & Accessories"},

    # ── Tier 3: $5K–$10K (higher unit cost, bulkier, certifications) ─────
    {"id": "standing-desk-converters", "query": "standing desk converter adjustable", "parent": "Office Products"},
    {"id": "air-purifiers-small", "query": "air purifier small room HEPA", "parent": "Home & Kitchen"},
    {"id": "electric-kettles", "query": "electric kettle stainless steel", "parent": "Home & Kitchen"},
    {"id": "weighted-blankets", "query": "weighted blanket adult cooling", "parent": "Home & Kitchen"},
    {"id": "smart-plugs-outlets", "query": "smart plug wifi outlet alexa", "parent": "Tools & Home Improvement"},
    {"id": "ring-lights-streaming", "query": "ring light tripod stand streaming", "parent": "Electronics"},
    {"id": "massage-guns", "query": "massage gun percussion deep tissue", "parent": "Health & Household"},
    {"id": "outdoor-solar-lights", "query": "solar lights outdoor pathway garden", "parent": "Patio, Lawn & Garden"},
    {"id": "portable-projectors", "query": "mini portable projector 1080p", "parent": "Electronics"},
    {"id": "electric-lunch-boxes", "query": "electric lunch box food warmer", "parent": "Home & Kitchen"},
    {"id": "baby-monitors", "query": "baby monitor camera wifi", "parent": "Baby"},
    {"id": "foam-rollers-recovery", "query": "foam roller muscle recovery set", "parent": "Sports & Outdoors"},
    {"id": "cast-iron-skillets", "query": "cast iron skillet pre-seasoned", "parent": "Home & Kitchen"},
    {"id": "camping-hammocks", "query": "camping hammock lightweight portable", "parent": "Sports & Outdoors"},
    {"id": "cordless-vacuums-handheld", "query": "handheld cordless vacuum car", "parent": "Home & Kitchen"},
    {"id": "electric-toothbrushes", "query": "electric toothbrush rechargeable sonic", "parent": "Health & Household"},
    {"id": "smart-water-bottles", "query": "smart water bottle temperature display", "parent": "Sports & Outdoors"},
    {"id": "bathroom-vanity-organizers", "query": "bathroom counter organizer vanity tray", "parent": "Home & Kitchen"},

    # ── Tier 4: $10K–$25K (premium, heavy/bulky, custom tooling) ─────────
    {"id": "standing-desks-electric", "query": "electric standing desk adjustable height", "parent": "Office Products"},
    {"id": "robot-vacuums", "query": "robot vacuum cleaner self-emptying", "parent": "Home & Kitchen"},
    {"id": "espresso-machines-semi", "query": "espresso machine semi-automatic home", "parent": "Home & Kitchen"},
    {"id": "outdoor-furniture-sets", "query": "patio furniture set outdoor", "parent": "Patio, Lawn & Garden"},
    {"id": "gaming-chairs", "query": "gaming chair ergonomic computer", "parent": "Office Products"},
    {"id": "air-fryers", "query": "air fryer large capacity digital", "parent": "Home & Kitchen"},
    {"id": "power-stations-portable", "query": "portable power station camping solar", "parent": "Sports & Outdoors"},
    {"id": "dog-crates-kennels", "query": "dog crate large heavy duty", "parent": "Pet Supplies"},
    {"id": "treadmills-compact", "query": "folding treadmill compact apartment", "parent": "Sports & Outdoors"},
    {"id": "security-cameras-outdoor", "query": "outdoor security camera wireless solar", "parent": "Electronics"},
    {"id": "luggage-sets", "query": "luggage set hardside spinner", "parent": "Clothing & Accessories"},
    {"id": "ergonomic-office-chairs", "query": "ergonomic office chair lumbar support", "parent": "Office Products"},
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


def scrape_all_categories(pages_per_category: int = 2, delay: float = 2.0, only_ids: list[str] | None = None) -> dict:
    """
    Scrape product listings for every category in CATEGORY_SEARCHES.
    Returns a dict keyed by category id, each containing a list of products.
    If only_ids is provided, only scrape those specific category IDs.
    """
    results = {}

    targets = CATEGORY_SEARCHES
    if only_ids:
        id_set = set(only_ids)
        targets = [c for c in CATEGORY_SEARCHES if c["id"] in id_set]
        if len(targets) != len(id_set):
            found = {c["id"] for c in targets}
            missing = id_set - found
            print(f"[scraper] Warning: unknown category IDs: {missing}")

    for cat in targets:
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
