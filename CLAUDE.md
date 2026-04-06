# CLAUDE.md — LaunchLens

## What This Is

LaunchLens is a web app for first-time Amazon FBA sellers to find what product to sell, starting from their budget. Built as a portfolio project for D'Andre South's data science internship (assigned by recruiter Ankur Tyagi).

Tagline: "You have $10K. This tool tells you where to put it."

**Live site:** https://launchlens.onrender.com (Render free tier, auto-deploys from GitHub)

---

## Current Status (as of April 6, 2026) — ALL PHASES COMPLETE

### What's done:
- All 7 screens built and working end-to-end
- **76/76 categories scraped, scored, and feature-analyzed** (~6,900 Amazon products)
- Site deployed and live on Render.com
- Cursor trail effect (green-tinted cubes follow mouse, cycle light→dark green)
- 3D prism background (Three.js crystals, persists across all screens)
- Favicon, Open Graph / Twitter Card meta tags
- SPA catch-all route, env validation, `/api/meta` endpoint

### Next focus: UI polish
- Improve each screen's layout, spacing, animations
- Better loading/skeleton states
- Mobile responsiveness pass
- About page / portfolio presentation

---

## Phases Completed

### Phase 1 — Project scaffold
- FastAPI backend, hash-based SPA router, `.env.example`, `requirements.txt`
- Git repo: https://github.com/officialdandresouth/launchlens

### Phase 2A — Category rankings backend + UI
- `GET /api/categories?budget=N` — filters by budget, sorts by composite score
- Pydantic schemas, JSON data loader, categories screen with score bars

### Phase 2B — Real data pipeline
- `backend/services/scraper.py` — ScraperAPI → Amazon search results
- `scripts/scrape_categories.py` — `--only`, `--append` flags for incremental runs
- `scripts/score_categories.py` — Claude tool use scoring; 5 dimensions
- `scripts/analyze_features.py` — Claude Haiku feature extraction per category

### Phase 3 — All 7 screens
- `GET /api/category/:id` — deep dive endpoint
- All 7 screen frontends (`budget.js`, `categories.js`, `deep_dive.js`, `spec.js`, `economics.js`, `suppliers.js`, `launch_plan.js`)
- AI routes: Screen 4 (Spec) = Claude Sonnet, Screens 6-7 = Claude Haiku

### Visual overhaul
- 3D prism background (`frontend/js/prism.js`) — Three.js via esm.sh CDN, dynamic import
- Category cards: glassmorphism, 3D pop-in animations, IntersectionObserver
- Navbar: transparent on hero, solid on scroll/other screens
- Dark premium theme throughout, Inter font

### Phase 6 — Polish + Deploy (April 2026)
- Deployed to Render (`render.yaml`, `Procfile`)
- Backend: startup env validation, `/api/meta` endpoint, SPA catch-all route
- Frontend: favicon SVG, meta/OG/Twitter tags, live data freshness badge in hero
- Removed unused mascot and particles.js
- Fixed blank-screen bug: prism.js loaded via dynamic import (CDN failures no longer crash app)
- **76 categories fully scraped** (~6,900 products), committed to repo
- Added cursor trail: green cubes (32–48px), light→dark green cycle, fade in place

---

## Tech Stack

- **Backend:** FastAPI + Uvicorn (Python 3.13)
- **Frontend:** Vanilla HTML/CSS/JS (`<script type="module">`, no framework)
- **AI:** Claude API — Haiku for batch extraction/suppliers/launch plan, Sonnet for product spec
- **3D:** Three.js 0.162.0 via `https://esm.sh/three@0.162.0` (loaded dynamically)
- **Data:** ScraperAPI (free tier, 5K credits/mo) → JSON files pre-computed at build time
- **Deploy:** Render.com free tier (auto-deploy from GitHub main branch)

---

## Running Locally

```bash
pip install -r requirements.txt
cp .env.example .env   # add ANTHROPIC_API_KEY and SCRAPER_API_KEY
cd launchlens
py -m uvicorn backend.main:app --reload --port 8000
# Open http://localhost:8000
```

---

## The 7 Screens

1. **Budget Input** — User sets capital, hero section with marquee stats and Why section
2. **Category Rankings** — 76 subcategories scored on margin/demand/competition, filtered by budget
3. **Category Deep Dive** — Feature satisfaction bars, opportunities, top products (pre-computed)
4. **Product Spec Brief** — Claude Sonnet generates manufacturer-ready spec via `POST /api/spec`
5. **Unit Economics** — Calculator for COGS, FBA fees, margins, ROI
6. **Supplier Links** — Claude Haiku generates Alibaba search links via `POST /api/suppliers`
7. **Launch Plan** — Date-anchored timeline via `POST /api/launch-plan`

---

## Data Strategy

- **76 categories** across 4 budget tiers ($1K–$2K, $2K–$5K, $5K–$10K, $10K–$25K)
- Pre-computed JSON stored in `backend/data/` — no per-request scraping
- Refresh pipeline: run the 3 scripts with `--only` + `--append` flags incrementally
- **Secrets needed:** `ANTHROPIC_API_KEY`, `SCRAPER_API_KEY` (in `.env` locally; Render env vars in prod)

---

## Project Structure

```
launchlens/
  backend/
    main.py                  # FastAPI app — routes, /api/meta, SPA catch-all
    routes/                  # categories, category_detail, spec, suppliers, launch_plan
    services/
      data_loader.py         # Loads JSON, filters by budget
      scraper.py             # ScraperAPI integration + CATEGORY_SEARCHES list
    models/                  # Pydantic schemas
    data/
      category_scores.json   # 76 AI-scored categories
      raw_scraped.json       # ~6,900 raw Amazon products
      feature_analysis.json  # 76 categories with feature extraction
  frontend/
    index.html               # HTML shell — navbar, progress bar, favicon, OG tags
    css/styles.css           # Dark premium theme
    js/
      app.js                 # Hash router + state + dynamic imports
      prism.js               # Three.js 3D crystal background (global)
      cursor-trail.js        # Green cube cursor trail effect
      screens/               # One JS file per screen (7 total)
    images/
      favicon.svg            # SVG favicon
  scripts/
    scrape_categories.py     # Scrape Amazon via ScraperAPI (--only, --append)
    score_categories.py      # Score via Claude tool use (--only)
    analyze_features.py      # Feature extraction via Claude Haiku (--only)
  render.yaml                # Render Blueprint deployment config
  Procfile                   # Fallback start command for Render
```
