"""Module 2 · L — the same API, on a real database.

Same endpoints, same URLs, same /docs as g1_crud_full.py. The only thing that
changed is where the data lives — and now it survives a restart.

Before running:  docker compose -f 02_apis_and_databases/docker-compose.yml up -d
Run:             uv run fastapi dev 02_apis_and_databases/l1_models_and_session.py

THE DEMO: add a student, Ctrl+C the server, start it again, GET /students.
The student is still there. That is the whole point of today.
"""
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import Integer, String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

# ── database.py, inlined so this file stands alone ────────────────────────
# driver://user:password@host:port/database — every DB URL has these six parts.
DATABASE_URL = "postgresql+psycopg://lpu:lpu@localhost:5432/lpudb"

# echo=True prints every SQL statement SQLAlchemy generates. TEACH WITH IT ON:
# watching the terminal is what stops students believing the ORM is magic.
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """The yield dependency from i1_depends.py, doing its real job.

    Everything before the yield is setup, everything after is cleanup — and the
    cleanup runs even if the endpoint raised. One session per request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── models.py — the DATABASE tables ───────────────────────────────────────
# Mapped[...] + mapped_column(...) is the SQLAlchemy 2.x style. Anything online
# using Column(...) and declarative_base() is 1.x-era — it runs, but don't mix.
class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    branch: Mapped[str] = mapped_column(String(10), default="CSE")
    age: Mapped[int] = mapped_column(Integer)
    email: Mapped[str] = mapped_column(String(120), unique=True)


# Creates any table that does not exist yet. It NEVER alters one that does —
# add a column here and it will not appear. That is what migrations (Alembic)
# are for. In class the fix is: docker compose down -v && docker compose up -d
Base.metadata.create_all(bind=engine)


# ── schemas.py — the API shapes ───────────────────────────────────────────
class StudentIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    branch: str = "CSE"
    age: int = Field(ge=16, le=100)
    email: EmailStr


class StudentOut(BaseModel):
    # Without this, Pydantic looks for student["name"] and a SQLAlchemy object
    # does not work that way. With it, Pydantic reads student.name
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    branch: str
    email: EmailStr


# ── main.py — every route, now on the database ────────────────────────────
app = FastAPI(title="Students — on PostgreSQL")


@app.get("/students", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.scalars(select(Student)).all()


@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No student with id {student_id}")
    return student


@app.post("/students", status_code=status.HTTP_201_CREATED, response_model=StudentOut)
def create_student(incoming: StudentIn, db: Session = Depends(get_db)):
    existing = db.scalar(select(Student).where(Student.email == incoming.email))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"{incoming.email} is already registered")

    student = Student(**incoming.model_dump())
    db.add(student)
    db.commit()           # nothing is real until this line
    db.refresh(student)   # the DATABASE assigned the id — this is how Python learns it
    return student


@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No student with id {student_id}")
    db.delete(student)
    db.commit()
    return None
