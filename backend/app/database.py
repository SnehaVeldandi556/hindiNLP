"""
Database connection and session factory for PostgreSQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import DATABASE_URL

DATABASE_URL = os.getenv("postgresql://neondb_owner:npg_e2vkotR3jqbD@ep-floral-cake-beq61smr-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=requirepostgresql://neondb_owner:npg_e2vkotR3jqbD@ep-floral-cake-beq61smr-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session and ensures closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
