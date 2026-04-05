# CLAUDE.md — LaunchLens

## What This Is

LaunchLens is a web app for first-time Amazon FBA sellers to find what product to sell, starting from their budget. Built as a portfolio project for D'Andre South's data science internship (assigned by recruiter Ankur Tyagi).

Tagline: "You have $10K. This tool tells you where to put it."

## Current Progress (as of April 5, 2026)

### Phase 1 — DONE:
- Project structure created at `C:\Users\justd\OneDrive\Desktop\launchlens\`
- Git repo initialized, pushed to GitHub (https://github.com/officialdandresouth/launchlens)
- FastAPI backend (`backend/main.py`) serves frontend + `/api/health` + `/images` static mount
- Hash-based client-side router (`frontend/js/app.js`) with progress bar auto-hide on hero
- `.env.example`, `.gitignore`, `requirements.txt` created

### Phase 2 Part A — DONE (Screen 2 backend + UI with seed data):
- `backend/data/category_scores.json` — 10 realistic Amazon subcategories as seed data
- `backend/models/category.py` — Pydantic schemas (ScoreBreakdown, TopProduct, CategoryScore, CategoriesResponse)
- `backend/services/data_loader.py` — loads JSON at startup, filters by budget, sorts by composite score
- `backend/routes/categories.py` — `GET /api/categories?budget=N` endpoint (validates 1000–25000)
- `frontend/js/screens/categories.js` — fetches API, renders ranked cards with score bars and color coding
- API tested and working

### Visual Redesign — DONE (Framer-style premium dark theme):
- **Design language:** Pure black background, minimal/premium aesthetic inspired by Framer templates
- **Particle animation:** `frontend/js/particles.js` — interactive canvas-based particle network (mouse repulsion, connected lines)
- **Screen 1 (Hero):** Centered layout with:
  - Pulsing green dot badge ("Updated weekly with live Amazon data")
  - Large headline: "Find What to Sell / Before You Invest"
  - Budget slider with dual CTAs (filled white + outlined)
  - Scroll-down mouse indicator
  - Auto-scrolling stats marquee ticker
- **Navbar:** Framer-style — logo left, nav links + white "Get Started" pill button right
- **CSS:** Complete rewrite — black bg, Inter font, pill buttons, 4px score bars, uppercase labels
- **Screen 2:** Updated to match — dark cards, thin score bars, green/yellow/red color coding
- Responsive at 768px and 480px breakpoints

### Phase 2 Part B — DONE (Real Data Pipeline):
- `backend/services/scraper.py` — ScraperAPI integration with autoparse for Amazon search results; 76 categories defined in `CATEGORY_SEARCHES` across 4 investment tiers ($1K–$2K, $2K–$5K, $5K–$10K, $10K–$25K); `scrape_all_categories()` supports `only_ids` filter for selective scraping
- `scripts/scrape_categories.py` — Supports `--only id1,id2` to scrape specific categories and `--append` to merge into existing data instead of overwriting
- `scripts/score_categories.py` — Supports `--only id1,id2` to score specific categories and merge with existing scores; scoring prompt updated to estimate `min_viable_budget` across the full $1K–$25K range based on COGS, MOQ, shipping, certifications
- `scripts/analyze_features.py` — Supports `--only id1,id2` to analyze specific categories and merge with existing feature analysis
- **1,662+ real Amazon products** scraped and scored across 16 categories (76 total defined, remaining to be scraped in phases)
- Scores based on: gross margin, demand satisfaction gap, revenue concentration, capital efficiency, barrier to entry
- Raw data stored in `backend/data/raw_scraped.json`, final scores in `backend/data/category_scores.json`

### Landing Page Enhancements — DONE:
- Removed scroll-down mouse animation
- Added "Why LaunchLens" section below hero — explains all 7 steps, directs users back to Get Started
- "How It Works" button scrolls to the Why section
- Animated stock trend lines (red/green alternating) that follow mouse cursor across screen
- Removed redundant "Categories" navbar link

### Phase 3 — DONE (Screen 3 Deep Dive + Screens 4-7 built):
- `GET /api/category/:id?budget=N` endpoint in `backend/routes/category_detail.py`
- `scripts/analyze_features.py` — Claude Haiku batch feature extraction per category
- `backend/data/feature_analysis.json` — 12 categories with features, opportunities, top products, market summaries
- `frontend/js/screens/deep_dive.js` — market summary, feature satisfaction bars, opportunities, product table
- All 7 screen frontends built (`deep_dive.js`, `spec.js`, `economics.js`, `suppliers.js`, `launch_plan.js`)
- All backend routes registered in `main.py` (spec, suppliers, launch_plan)
- Screen 4 (Spec) uses Claude Sonnet via `POST /api/spec` with tool use
- Screen 6 (Suppliers) uses Claude Haiku via `POST /api/suppliers`
- Screen 7 (Launch Plan) uses Claude Haiku via `POST /api/launch-plan`

### Visual Overhaul (April 2026):
- **3D Prism background (global):** `frontend/js/prism.js` — Three.js (via CDN) iridescent octahedron crystals with colored accent lights, floating particles that fade in/out, crystals breathe opacity, mouse-reactive camera sway. **Lives in `index.html` and persists across ALL 7 screens** (initialized once in `app.js`, never destroyed during navigation)
- **Navbar:** Transparent on hero (floats over 3D scene), fades to solid dark on scroll or other screens
- **Mascot character:** `frontend/js/mascot.js` — fixed bottom-right, scroll-reactive (tilts up when scrolling down, tilts down when scrolling up, smooth spring animation). Image at `frontend/images/mascot.png` (needs to be saved manually)
- **Removed:** Particle canvas (`particles.js` still exists but unused), stock trend lines (fully removed), per-screen ambient color themes (removed — all screens share the same prism background)
- **Hero changes:** "Get Started" replaces "Show Me What I Can Sell", bottom CTA goes to categories screen, navbar "Get Started" pill removed, "About" scrolls to Why section, "Home" scrolls to top

### Category Expansion — IN PROGRESS:
- **76 total categories defined** in `scraper.py` across 4 tiers: $1K–$2K (19 categories), $2K–$5K (27), $5K–$10K (18), $10K–$25K (12)
- 16 categories already scraped and scored; remaining 60 to be scraped in phases using free ScraperAPI tier (760 credits per full run, well within 5K/month)
- All 3 pipeline scripts support incremental `--only` flag for phased rollout
- GitHub Actions workflow updated with `only_categories` input for selective manual refreshes
- Marquee stats updated to "75+ Categories Analyzed" and "5,000+ Products Tracked"

### Category Card 3D Animations — DONE:
- **3D pop-up entrance:** `@keyframes cardPopIn` — cards start invisible, rotated on X-axis, scaled down, and blurred; swing up into place with subtle overshoot bounce on scroll
- **IntersectionObserver** in `categories.js` triggers animation when cards enter viewport; staggered 100ms per card via `--card-delay` CSS variable
- **Glassmorphism card style:** gradient background with `backdrop-filter: blur(12px)`, inset top-edge highlight, deeper shadow + scale-up on hover
- **Score bar glow:** bars have gradient fill with colored glow/bloom effect per score color
- **Composite score badge:** subtle ambient glow that intensifies on hover
- **Explore button:** lifts with shadow on hover for tactile depth

### Next:
- Save mascot image to `frontend/images/mascot.png`
- Scrape remaining 60 categories in 3 phases (Tier 1+2, Tier 3, Tier 4)
- Test all 7 screens end-to-end
- Phase 6: Polish, deploy to Render

## Tech Stack

- **Backend:** FastAPI + Uvicorn (Python 3.13)
- **Frontend:** Vanilla HTML/CSS/JS with `<script type="module">` (no framework)
- **AI:** Claude API — Haiku for batch extraction, Sonnet for reasoning (Screen 4)
- **Data:** ScraperAPI (free tier, 5K credits/mo) → BeautifulSoup parsing → Claude processing → JSON files
- **Deploy:** Render.com (free tier, auto-deploy from GitHub)

## Running Locally

```bash
pip install -r requirements.txt
cp .env.example .env   # add your keys
cd launchlens
python -m uvicorn backend.main:app --reload --port 8000
# Open http://localhost:8000
```

Note: On this machine, use full Python path if `python` doesn't resolve:
```bash
/c/Users/justd/AppData/Local/Programs/Python/Python313/python.exe -m uvicorn backend.main:app --reload --port 8000
```

## The 7 Screens

1. **Budget Input** (Novel) — User enters starting capital, filters categories
2. **Category Rankings** (Partially Novel) — Up to 76 subcategories scored on margin, demand gap, etc., filtered by budget
3. **Category Deep Dive** (Novel, biggest differentiator) — Cross-product feature satisfaction from reviews via Claude
4. **Product Spec Brief** (Novel) — Claude Sonnet generates manufacturer-ready spec
5. **Unit Economics** (Table stakes) — Calculator for costs, margins, ROI
6. **Supplier Links** (Table stakes) — Alibaba search links from Claude Haiku
7. **Launch Plan** (Partially Novel) — Personalized date-anchored timeline from Claude Haiku

## Data Strategy

- **Source:** ScraperAPI (free tier) fetches Amazon HTML → BeautifulSoup parses it
- **Processing:** Claude Haiku extracts structured data + feature analysis per category
- **Storage:** Pre-computed JSON files (`products.json`, `feature_analysis.json`, `category_scores.json`)
- **Refresh:** GitHub Actions cron every Monday 1:30 PM EST — fetch, process, commit, auto-deploy; supports `only_categories` input for selective manual refreshes
- **Incremental pipeline:** All scripts accept `--only id1,id2` to process specific categories and merge results with existing data (`--append` for scraper)
- **Secrets needed:** `ANTHROPIC_API_KEY`, `SCRAPER_API_KEY`

## Project Structure

```
launchlens/
  backend/
    main.py                  # FastAPI app
    routes/                  # API route files per screen
    services/
      data_loader.py         # Loads JSON, filters by budget
      scraper.py             # ScraperAPI integration (Amazon search)
    models/                  # Pydantic schemas
    data/
      category_scores.json   # AI-scored categories (from real data)
      raw_scraped.json       # Raw scraped Amazon product data
  frontend/
    index.html               # HTML shell with navbar + progress bar
    css/styles.css           # Dark theme
    js/app.js                # Hash router + state management
    js/particles.js          # Interactive particle canvas
    js/screens/              # One JS file per screen
    images/                  # Static images (hero, etc.)
  scripts/
    scrape_categories.py     # Scrapes Amazon via ScraperAPI (--only, --append)
    score_categories.py      # Scores categories via Claude Haiku tool use (--only)
    analyze_features.py      # Extracts features via Claude Haiku (--only)
  .github/workflows/
    refresh_data.yml         # Weekly cron + manual dispatch with only_categories input
```

## Full Plan File

The complete implementation plan is at: `C:\Users\justd\.claude\plans\snappy-snacking-flurry.md`
