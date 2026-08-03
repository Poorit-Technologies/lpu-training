"""Saying "no" properly - status codes and HTTPException.

Run:   uv run fastapi dev 01_foundations/d4_errors.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, HTTPException, status

app = FastAPI(title="Errors Demo")

students = {1: "Ada", 2: "Raj"}


# The four numbers you need today:
#   200 OK          - here you go
#   201 Created     - I made it
#   404 Not Found   - no such thing
#   422 Unprocessable - your request was malformed (FastAPI sends this for you)


# Try:  /students/1      then try:  /students/99
@app.get("/students/{student_id}")
def get_student(student_id: int):
    if student_id not in students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No student with id {student_id}",   # say WHICH one is missing
        )
    return {"id": student_id, "name": students[student_id]}


# raise, don't return. Returning {"error": "..."} sends a 200 -
# the caller's code sees "success" and carries on with nonsense.
@app.get("/bad-example/{student_id}")
def bad_example(student_id: int):
    if student_id not in students:
        return {"error": "not found"}      # status is 200. This is the bug.
    return {"id": student_id}


# Compare the two in /docs and watch the status code, not the text.
