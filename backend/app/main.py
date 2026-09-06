"""
FastAPI Main Application for ShikayatAI.
Exposes REST endpoints for:
- Authentication
- Complaint Submission & Lifecycle
- Machine Learning Classification & Recommender
- Municipal Operational Analytics
"""

import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root workspace is on python path
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app.config import PROJECT_NAME, VERSION, DEBUG
from backend.app.api.auth import router as auth_router
from backend.app.api.complaints import router as complaints_router
from backend.app.api.ml import router as ml_router
from backend.app.api.analytics import router as analytics_router
from backend.app.database import engine, Base

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description="ShikayatAI: Hindi Smart Complaint Classification and Resolution Analysis System"
)

# CORS configuration to allow local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(complaints_router, prefix="/api")
app.include_router(ml_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": PROJECT_NAME,
        "version": VERSION,
        "status": "operational",
        "docs": "/docs",
        "api_prefix": "/api"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_model": "loaded"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
