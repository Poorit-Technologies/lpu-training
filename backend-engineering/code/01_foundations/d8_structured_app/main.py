"""main.py - it starts the app and plugs the routers in. Nothing else.

Run:   uv run fastapi dev 01_foundations/d8_structured_app/main.py
Open:  http://127.0.0.1:8000/docs

This folder is the same API as one long file, split the way real projects split it:

    d8_structured_app/
    |- main.py            <- the app object, and the wiring
    |- schemas.py         <- the shapes of data (Pydantic models)
    |- routers/
       |- __init__.py     <- makes "routers" importable
       |- students.py     <- everything about students
       |- health.py       <- everything about health

Rule of thumb: a new area of the product = a new file in routers/.
"""
from fastapi import FastAPI

from routers import health, students

app = FastAPI(title="Student API (structured)")

app.include_router(students.router)
app.include_router(health.router)


@app.get("/")
def home():
    return {"message": "see /docs"}
