"""
Application Configuration for ShikayatAI.
Reads environment variables with sensible defaults.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/shikayatai_db"
)

# JWT Secret
SECRET_KEY = os.getenv("SECRET_KEY", "shikayatai_super_secure_civic_secret_key_2026_jwt_token")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# App settings
PROJECT_NAME = "ShikayatAI: Hindi Smart Complaint Classification System"
VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
