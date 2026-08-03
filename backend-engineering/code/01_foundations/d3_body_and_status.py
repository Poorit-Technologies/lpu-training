"""Data coming IN (a request body), and choosing what goes OUT.

Run:   uv run fastapi dev 01_foundations/d3_body_and_status.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI(title="Body and Status Demo")

students = []


# What we ACCEPT. Note the password - a real signup needs one.
class StudentIn(BaseModel):
    name: str
    branch: str = "CSE"
    age: int
    password: str


# What we RETURN. No password here. On purpose.
class StudentOut(BaseModel):
    id: int
    name: str
    branch: str


@app.post(
    "/students",
    status_code=status.HTTP_201_CREATED,   # 201 = "created", not plain 200
    response_model=StudentOut,             # the shape of the answer
)
def create_student(new_student: StudentIn):
    student = {
        "id": len(students) + 1,
        "name": new_student.name,
        "branch": new_student.branch,
        "age": new_student.age,
        "password": new_student.password,
    }
    students.append(student)
    return student      # age and password are dropped - response_model filters them


@app.get("/students", response_model=list[StudentOut])
def list_students():
    return students


# The lesson: returning the wrong thing is a real bug that leaks real data.
# response_model makes the shape of your answer a rule, not a hope.
