from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import init_db
from app.api import upload, project, mockup, security


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads and mockups
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.mockup_dir.mkdir(parents=True, exist_ok=True)

app.mount("/api/uploads", StaticFiles(directory=str(settings.upload_dir)), name="uploads")
app.mount("/api/mockups", StaticFiles(directory=str(settings.mockup_dir)), name="mockups")

# Register routers
app.include_router(upload.router)
app.include_router(project.router)
app.include_router(mockup.router)
app.include_router(security.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
