"""Module 2 · G — Full CRUD, still in memory.

The Module-1 app had GET and POST. Here are the other three verbs, plus the
status codes that go with them. Storage is STILL a Python list on purpose:
one new thing at a time. The database arrives in l1_models_and_session.py.

Run:  uv run fastapi dev 02_apis_and_databases/g1_crud_full.py
Then: http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="Students — full CRUD")


class StudentIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    branch: str = "CSE"
    age: int = Field(ge=16, le=100)
    email: EmailStr


class StudentPatch(BaseModel):
    """Every field optional — this is what makes PATCH different from PUT."""
    name: str | None = Field(default=None, min_length=2, max_length=80)
    branch: str | None = None
    age: int | None = Field(default=None, ge=16, le=100)
    email: EmailStr | None = None


class StudentOut(BaseModel):
    id: int
    name: str
    branch: str
    email: EmailStr


students: list[dict] = [
    {"id": 1, "name": "Ada", "branch": "CSE", "age": 20, "email": "ada@lpu.in"},
    {"id": 2, "name": "Raj", "branch": "ECE", "age": 21, "email": "raj@lpu.in"},
]


def _find(student_id: int) -> dict:
    """Return the student or raise 404. One place, so every endpoint agrees."""
    for student in students:
        if student["id"] == student_id:
            return student
    raise HTTPException(status.HTTP_404_NOT_FOUND, f"No student with id {student_id}")


@app.get("/students", response_model=list[StudentOut])
def list_students():
    return students


@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int):
    return _find(student_id)


# 409 = "that clashes with something that already exists"
@app.post("/students", status_code=status.HTTP_201_CREATED, response_model=StudentOut)
def create_student(incoming: StudentIn):
    if any(s["email"] == incoming.email for s in students):
        raise HTTPException(status.HTTP_409_CONFLICT,
                            f"{incoming.email} is already registered")
    student = {"id": max((s["id"] for s in students), default=0) + 1, **incoming.model_dump()}
    students.append(student)
    return student


# PUT replaces the WHOLE record. A missing field is not "leave it alone" —
# it is "the new record does not have one", and Pydantic will reject the body.
@app.put("/students/{student_id}", response_model=StudentOut)
def replace_student(student_id: int, incoming: StudentIn):
    student = _find(student_id)
    student.update(incoming.model_dump())
    return student


# PATCH changes only what was sent. exclude_unset=True is the entire lesson:
# without it, every field the caller did not send arrives as None and erases
# the value that was already there.
@app.patch("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, changes: StudentPatch):
    student = _find(student_id)
    student.update(changes.model_dump(exclude_unset=True))
    return student


# 204 = done, and there is deliberately nothing to show you.
# Return None — a 204 with a body is an error, not a style choice.
@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int):
    students.remove(_find(student_id))
    return None
