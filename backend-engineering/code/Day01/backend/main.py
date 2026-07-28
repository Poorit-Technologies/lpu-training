"""Day 1 · Backend — your first FastAPI app (no API key needed).

Run:   uv run fastapi dev Day01/backend/main.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Student API")

# a simple in-memory "database"
students: list[dict] = [
    {"id": 1, "name": "Ada", "branch": "CSE"},
    {"id": 2, "name": "Raj", "branch": "ECE"},
]


class StudentIn(BaseModel):
    name: str
    branch: str = "CSE"
    age: int | None = None


@app.get("/")
def home():
    return {"message": "Backend is live 🎉"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/students")
def list_students():
    return students


@app.get("/students/{student_id}")
def get_student(student_id: int):
    for s in students:
        if s["id"] == student_id:
            return s
    raise HTTPException(status_code=404, detail="Student not found")


@app.post("/students")
def create_student(s: StudentIn):
    new = {"id": len(students) + 1, "name": s.name, "branch": s.branch}
    students.append(new)
    return new
