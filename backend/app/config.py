"""
Application Configuration for ShikayatAI.
Reads environment variables with sensible defaults.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database configuration
raw_db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/shikayatai_db"
)

# 1. SQLAlchemy requires postgresql:// instead of legacy postgres:// used by some cloud providers
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# 2. Explicitly bind psycopg2/psycopg driver so SQLAlchemy doesn't fail if the other is absent
if raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
    try:
        import psycopg2
        DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    except ImportError:
        try:
            import psycopg
            DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        except ImportError:
            DATABASE_URL = raw_db_url
else:
    DATABASE_URL = raw_db_url

# CORS Origins (comma-separated list for production)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")

# JWT Secret
SECRET_KEY = os.getenv("SECRET_KEY", "shikayatai_super_secure_civic_secret_key_2026_jwt_token")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# App settings
PROJECT_NAME = "ShikayatAI: Hindi Smart Complaint Classification System"
VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
