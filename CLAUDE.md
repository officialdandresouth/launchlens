# CLAUDE.md — LaunchLens

## What This Is

LaunchLens is a web app for first-time Amazon FBA sellers to find what product to sell, starting from their budget. Built as a portfolio project for D'Andre South's data science internship (assigned by recruiter Ankur Tyagi).

Tagline: "You have $10K. This tool tells you where to put it."

## Current Progress (as of April 3, 2026)

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

### Phase 2 Part B — NOT STARTED (Real Data Pipeline):
- `scripts/fetch_data.py` — ScraperAPI fetcher (user has API key ready)
- `scripts/preprocess.py` — BeautifulSoup parser + Claude Haiku analysis
- `scripts/seed_scores.py` — scoring algorithm

### Next:
- Build real data pipeline (Phase 2 Part B)
- Phase 3: Screen 3 (Category Deep Dive — biggest differentiator)

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
2. **Category Rankings** (Partially Novel) — 10-15 subcategories scored on margin, demand gap, etc.
3. **Category Deep Dive** (Novel, biggest differentiator) — Cross-product feature satisfaction from reviews via Claude
4. **Product Spec Brief** (Novel) — Claude Sonnet generates manufacturer-ready spec
5. **Unit Economics** (Table stakes) — Calculator for costs, margins, ROI
6. **Supplier Links** (Table stakes) — Alibaba search links from Claude Haiku
7. **Launch Plan** (Partially Novel) — Personalized date-anchored timeline from Claude Haiku

## Data Strategy

- **Source:** ScraperAPI (free tier) fetches Amazon HTML → BeautifulSoup parses it
- **Processing:** Claude Haiku extracts structured data + feature analysis per category
- **Storage:** Pre-computed JSON files (`products.json`, `feature_analysis.json`, `category_scores.json`)
- **Refresh:** GitHub Actions cron every Monday 1:30 PM EST — fetch, process, commit, auto-deploy
- **Secrets needed:** `ANTHROPIC_API_KEY`, `SCRAPER_API_KEY`

## Project Structure

```
launchlens/
  backend/
    main.py                  # FastAPI app
    routes/                  # API route files per screen
    services/                # Claude wrapper, data loading, scoring
    models/                  # Pydantic schemas
    data/                    # Pre-computed JSON files
  frontend/
    index.html               # HTML shell with navbar + progress bar
    css/styles.css           # Dark theme
    js/app.js                # Hash router + state management
    js/screens/              # One JS file per screen
    js/components/           # Shared components (charts, loading)
    images/                  # Static images (hero, etc.)
  scripts/
    fetch_data.py            # ScraperAPI data fetching
    preprocess.py            # Claude processing pipeline
    seed_scores.py           # Category ranking computation
  .github/workflows/
    refresh_data.yml         # Weekly cron automation
```

## Full Plan File

The complete implementation plan is at: `C:\Users\justd\.claude\plans\snappy-snacking-flurry.md`
