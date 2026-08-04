"""main.py — it starts the app and plugs the routers in. Nothing else.

Before running:  docker compose -f 02_apis_and_databases/docker-compose.yml up -d
Run:             uv run fastapi dev 02_apis_and_databases/course_api/main.py
Open:            http://127.0.0.1:8000/docs

The Module-2 build, laid out the way real projects are laid out:

    course_api/
    |- main.py            <- the app object, and the wiring
    |- database.py        <- engine, SessionLocal, get_db
    |- models.py          <- the DATABASE tables
    |- schemas.py         <- the API shapes (in and out)
    |- routers/
       |- __init__.py     <- makes "routers" a package
       |- courses.py      <- everything about courses
       |- students.py     <- everything about students

Try it in this order:
    1. POST /courses      {"code": "CSE101", "title": "Intro to Backend"}
    2. POST /students     {"name": "Ada", "email": "ada@lpu.in", "course_code": "CSE101"}
    3. GET  /courses/CSE101      <- the course WITH its students
    4. Ctrl+C, start it again, GET /courses      <- still there. That is the win.
"""
from fastapi import FastAPI

from database import Base, engine
from routers import courses, students

# Creates any table that does not exist yet. It never ALTERS an existing one —
# changing a model's columns is a migration's job (Alembic). In class, reset with:
#   docker compose down -v && docker compose up -d
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Course API",
    description="Module 2 — REST, CRUD, PostgreSQL and a one-to-many relationship.",
)

app.include_router(courses.router)
app.include_router(students.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
