"""Depends - write a piece of logic once, reuse it in every endpoint.

Run:   uv run fastapi dev 01_foundations/d6_depends.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI(title="Depends Demo")


# --- A dependency is just a function ---------------------------------------
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}


# ...that FastAPI calls for you, and hands you the result.
@app.get("/students")
def list_students(page: dict = Depends(pagination)):
    return {"students": ["Ada", "Raj"], "page": page}


@app.get("/courses")
def list_courses(page: dict = Depends(pagination)):     # same two params, no repetition
    return {"courses": ["CS101"], "page": page}


# --- The real use: a check that guards an endpoint ------------------------
# Try it in /docs - send x-token: secret123, then send something else.
# 401 = "I don't know who you are". Module 3 replaces the hardcoded string
# with a real login and a real token.
def verify_token(x_token: str | None = Header(default=None)):
    if x_token != "secret123":
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return x_token


@app.get("/admin")
def admin_area(token: str = Depends(verify_token)):
    return {"message": "welcome, admin"}


# Notice: admin_area contains no checking code at all. The dependency ran
# first, and if it raised, the endpoint never ran.
# This is how database sessions work in Module 2, and how logins work in Module 3.
