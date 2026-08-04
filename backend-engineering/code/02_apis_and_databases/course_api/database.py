"""Everything about connecting to the database — and nothing else."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# driver://user:password@host:port/database
# In a real project this comes from an environment variable, never a literal.
DATABASE_URL = "postgresql+psycopg://lpu:lpu@localhost:5432/lpudb"

# The ENGINE is the connection pool. One per app, created once.
engine = create_engine(DATABASE_URL, echo=True)

# A SESSION is one unit of work. One per request.
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    """Every model inherits from this, which is how metadata.create_all finds them."""


def get_db():
    """Hand a session to an endpoint, and guarantee it gets closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
