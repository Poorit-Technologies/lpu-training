"""Path params, query params, and putting rules on both.

Run:   uv run fastapi dev 01_foundations/d2_params.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, Path, Query

app = FastAPI(title="Params Demo")


# --- PATH param - part of the address. Answers "WHICH one?" ----------------
# Try:  /students/7        then try:  /students/abc
# @app.get("/students/{student_id}")
# def get_student(student_id: int):        # this int hint IS the validation
#     return {"id": student_id, "name": "Ada123"}


# --- QUERY params - the bit after the ?. Answers "HOW do you want it?" -----
# Try:  /students?branch=CSE&limit=5     then just:  /students
@app.get("/students/{student_id}")
def list_students(student_id: int, branch: str | None = None, limit: int = 10):
    return {"student_id":student_id, "branch": branch, "limit": limit}


# --- Adding RULES with Path() and Query() ---------------------------------
# Same params, now with limits and documentation.
# Try:  /courses/0        (too small)
# Try:  /courses/5?search=a       (search too short)
@app.get("/courses/{course_id}")
def get_course(
    course_id: int = Path(ge=1, description="Course id, 1 or higher"),
    search: str | None = Query(default=None, min_length=3, max_length=20),
    limit: int = Query(default=10, ge=1, le=100),
):
    return {"course_id": course_id, "search": search, "limit": limit}


# Every rule you write here shows up in /docs automatically.
