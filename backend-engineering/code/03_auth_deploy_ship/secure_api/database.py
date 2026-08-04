"""Connecting to the database — unchanged from Module 2, except for one thing.

DATABASE_URL now comes from the ENVIRONMENT, with the local value as a fallback.
That single change is what lets the same image run on your laptop and on Render.
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Inside Docker the host is "db" (the service name), not "localhost".
# On Render, the platform injects a real DATABASE_URL and neither default applies.
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://lpu:lpu@localhost:5432/lpudb"
)

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
