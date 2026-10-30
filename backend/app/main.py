"""
BankSight AI — Main FastAPI Application Entrypoint
=================================================
Module: backend/app/main.py
Author: BankSight AI Engineering Team

Assembles the FastAPI application with:
1. Versioned REST API endpoints under /api/v1/ and /api/
2. Automatic OpenAPI documentation (Swagger at /docs, ReDoc at /redoc)
3. CORS middleware configuration for React / Vite single-page dashboard
4. Static files mounting for integrated production deployment
"""
import os
import sys
import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure root workspace directory is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.routes.api import router as core_router
from backend.app.routes.customers import router as customers_router
from backend.app.routes.segmentation import router as segmentation_router
from backend.app.routes.predictions import router as predictions_router
from backend.app.routes.eara import router as eara_router
from backend.app.routes.fairness import router as fairness_router
from backend.app.routes.simulation import router as simulation_router
from backend.app.routes.assistant import router as assistant_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.survival import router as survival_router
from backend.app.routes.uplift import router as uplift_router
from backend.app.routes.network import router as network_router
from backend.app.routes.drift import router as drift_router
from backend.app.routes.analytics_visualizer import visualizer_router
from backend.app.routes.customer_management import router as customer_mgmt_router
from backend.app.websocket_manager import manager as ws_manager, live_banking_simulator_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("BankSight.Main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager handling startup initialization, cache warming, and telemetry loops."""
    logger.info("Initializing BankSight AI analytics engines and models...")
    # Trigger database cache load
    from backend.app.database import get_scored_portfolio_df
    get_scored_portfolio_df()
    logger.info("BankSight AI backend service ready.")

    # Start live telemetry stream simulator loop in background
    sim_task = asyncio.create_task(live_banking_simulator_loop())
    logger.info("Live banking telemetry generator started.")

    yield

    logger.info("Shutting down BankSight AI backend service...")
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass
    logger.info("BankSight AI shutdown complete.")


app = FastAPI(
    title="BankSight AI: Explainable Customer Segmentation & Churn Intelligence",
    description=(
        "Production-grade European retail banking analytics, churn prediction, "
        "SHAP explainability, and Evidence-Aware Retention Allocation (EARA) platform."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers under /api/v1/ and /api/
for prefix in ["/api/v1", "/api"]:
    app.include_router(core_router, prefix=prefix)
    app.include_router(customers_router, prefix=prefix)
    app.include_router(segmentation_router, prefix=prefix)
    app.include_router(predictions_router, prefix=prefix)
    app.include_router(eara_router, prefix=prefix)
    app.include_router(fairness_router, prefix=prefix)
    app.include_router(simulation_router, prefix=prefix)
    app.include_router(assistant_router, prefix=prefix)
    app.include_router(reports_router, prefix=prefix)
    app.include_router(survival_router, prefix=prefix)
    app.include_router(uplift_router, prefix=prefix)
    app.include_router(network_router, prefix=prefix)
    app.include_router(drift_router, prefix=prefix)
    app.include_router(visualizer_router, prefix=prefix)
    app.include_router(customer_mgmt_router, prefix=prefix)


# WebSocket Endpoints for Live Operations Telemetry Stream
@app.websocket("/ws/live-operations")
@app.websocket("/api/v1/ws/live-operations")
async def websocket_live_operations_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep socket alive and handle incoming client commands if any
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


# Frontend Integration
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
FRONTEND_DIR = ROOT_DIR / "frontend"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/pranav_avatar.jpg")
    def serve_pranav_avatar():
        p = FRONTEND_DIST / "pranav_avatar.jpg"
        if not p.exists():
            p = FRONTEND_DIR / "public" / "pranav_avatar.jpg"
        return FileResponse(p)

    @app.get("/bank_hero.jpg")
    def serve_bank_hero():
        p = FRONTEND_DIST / "bank_hero.jpg"
        if not p.exists():
            p = FRONTEND_DIR / "public" / "bank_hero.jpg"
        return FileResponse(p)

    @app.get("/")
    def serve_frontend_dist():
        index_html = FRONTEND_DIST / "index.html"
        return FileResponse(index_html)

    # SPA Fallback for client-side navigation
    @app.get("/{full_path:path}")
    def serve_spa_fallback(full_path: str):
        static_file = FRONTEND_DIST / full_path
        if static_file.is_file():
            return FileResponse(static_file)
        index_html = FRONTEND_DIST / "index.html"
        if index_html.exists():
            return FileResponse(index_html)
        raise HTTPException(status_code=404, detail="Resource not found")
elif FRONTEND_DIR.exists() and (FRONTEND_DIR / "index.html").exists():
    @app.get("/")
    def serve_frontend_html():
        return FileResponse(FRONTEND_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    import socket

    def find_free_port(preferred: int = 8000) -> int:
        for p in [preferred, 8001, 8080, 8501, 8088, 5000]:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(("0.0.0.0", p))
                    return p
            except OSError:
                continue
        return preferred

    cli_port = None
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        cli_port = int(sys.argv[1])
    elif "PORT" in os.environ:
        cli_port = int(os.environ["PORT"])

    selected_port = cli_port if cli_port else find_free_port(8000)
    server_host = os.environ.get("HOST", "0.0.0.0")
    print(f"\n{'='*70}\n  BankSight AI Production Platform\n  Serving at: http://{server_host}:{selected_port}\n  API docs:   http://{server_host}:{selected_port}/docs\n{'='*70}\n")
    uvicorn.run("backend.app.main:app", host=server_host, port=selected_port, reload=False)
