"""The Student API - everything from today, in one small app.

Run:   uv run fastapi dev 01_foundations/student_api.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel, Field

app = FastAPI(title="Student API")

# Today's "database": a plain Python list. It lives in memory, so everything
# is lost when the server restarts. Module 3 fixes that.
students = [
    {"id": 1, "name": "Ada", "branch": "CSE", "age": 20, "password": "secret"},
    {"id": 2, "name": "Raj", "branch": "ECE", "age": 21, "password": "secret"},
]


# What we accept...
class StudentIn(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    branch: str = "CSE"
    age: int = Field(ge=16, le=100)
    password: str = Field(min_length=6)


# ...and what we hand back. No password.
class StudentOut(BaseModel):
    id: int
    name: str
    branch: str
    age: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/students", response_model=list[StudentOut])
def list_students(branch: str | None = Query(default=None)):
    if branch is None:
        return students
    return [s for s in students if s["branch"] == branch]


@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int):
    for student in students:
        if student["id"] == student_id:
            return student
    raise HTTPException(status_code=404, detail=f"No student with id {student_id}")


@app.post("/students", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(new_student: StudentIn):
    student = {"id": len(students) + 1, **new_student.model_dump()}
    students.append(student)
    return student
