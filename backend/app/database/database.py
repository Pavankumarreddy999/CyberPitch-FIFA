from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./cyberpitch.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def run_migrations():
    """Safe idempotent migrations for existing SQLite databases."""
    with engine.connect() as conn:
        # Add confidence_score to scan_history if missing
        try:
            conn.execute(text(
                "ALTER TABLE scan_history ADD COLUMN confidence_score REAL"
            ))
            conn.commit()
        except Exception:
            pass  # Column already exists — safe to ignore


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()