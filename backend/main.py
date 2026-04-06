import json
import os
import warnings

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

load_dotenv()

app = FastAPI(title="LaunchLens", version="0.1.0")


@app.on_event("startup")
def validate_env():
    if not os.getenv("ANTHROPIC_API_KEY"):
        warnings.warn("ANTHROPIC_API_KEY not set — AI routes (spec, suppliers, launch-plan) will fail")

# --- API Routes ---
from backend.routes.categories import router as categories_router
from backend.routes.category_detail import router as category_detail_router
from backend.routes.spec import router as spec_router
from backend.routes.suppliers import router as suppliers_router
from backend.routes.launch_plan import router as launch_plan_router
app.include_router(categories_router)
app.include_router(category_detail_router)
app.include_router(spec_router)
app.include_router(suppliers_router)
app.include_router(launch_plan_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/meta")
def get_metadata():
    data_dir = Path(__file__).resolve().parent / "data"
    scores_path = data_dir / "category_scores.json"
    if scores_path.exists():
        raw = json.loads(scores_path.read_text(encoding="utf-8"))
        return {
            "data_updated_at": raw.get("generated_at"),
            "category_count": len(raw.get("categories", [])),
        }
    return {"data_updated_at": None, "category_count": 0}


# --- Serve Frontend ---

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/css", StaticFiles(directory=frontend_dir / "css"), name="css")
app.mount("/js", StaticFiles(directory=frontend_dir / "js"), name="js")
app.mount("/images", StaticFiles(directory=frontend_dir / "images"), name="images")


@app.get("/")
def serve_index():
    return FileResponse(frontend_dir / "index.html")


# SPA catch-all — return index.html for any unmatched path
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    return FileResponse(frontend_dir / "index.html")
