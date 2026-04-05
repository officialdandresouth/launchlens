from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI(title="LaunchLens", version="0.1.0")

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


# --- Serve Frontend ---

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/css", StaticFiles(directory=frontend_dir / "css"), name="css")
app.mount("/js", StaticFiles(directory=frontend_dir / "js"), name="js")
app.mount("/images", StaticFiles(directory=frontend_dir / "images"), name="images")


@app.get("/")
def serve_index():
    return FileResponse(frontend_dir / "index.html")
