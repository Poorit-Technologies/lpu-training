"""Module 2 · I — Depends, taught cold.

A dependency is a function that runs BEFORE your endpoint, whose return value
is handed to it. Three facts:
  1. FastAPI calls it for you — you never write get_page(...).
  2. Its parameters become your endpoint's parameters, and appear in /docs.
  3. If it raises, your endpoint never runs.

The yield version at the bottom is the one that matters this afternoon: it is
exactly the shape of the database session in l1_models_and_session.py.

Run:  uv run fastapi dev 02_apis_and_databases/i1_depends.py
Try:  /students?limit=500  ·  /admin  (with and without the x-token header)
"""
from fastapi import Depends, FastAPI, Header, HTTPException, status

app = FastAPI(title="Depends, from zero")

SECRET = "lpu-2026"
students = [{"id": i, "name": f"Student {i}"} for i in range(1, 51)]


# ── 1 · A dependency that supplies a value ────────────────────────────────
def get_page(limit: int = 10, offset: int = 0) -> dict:
    """One place caps the page size. Every endpoint that uses it is capped."""
    return {"limit": min(limit, 100), "offset": offset}


@app.get("/students")
def list_students(page: dict = Depends(get_page)):
    # ?limit= and ?offset= still work, and still show up in /docs — they were
    # declared on the dependency, not here.
    return students[page["offset"]: page["offset"] + page["limit"]]


# ── 2 · A dependency that says no ─────────────────────────────────────────
def verify_token(x_token: str = Header(...)):
    if x_token != SECRET:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad token")


# dependencies=[...] runs it purely for the side effect — the endpoint has no
# checking code at all. In Module 3 this exact shape becomes get_current_user.
@app.get("/admin", dependencies=[Depends(verify_token)])
def admin():
    return {"ok": True, "secret": "the list of everyone's marks"}


# ── 3 · yield — setup, then guaranteed cleanup ────────────────────────────
class FakeConnection:
    def __init__(self):
        print("  -> opened")

    def close(self):
        print("  -> closed")


def get_connection():
    conn = FakeConnection()
    try:
        yield conn          # the endpoint runs HERE, holding conn
    finally:
        conn.close()        # and this ALWAYS runs, even if the endpoint raised


@app.get("/with-cleanup")
def with_cleanup(conn: FakeConnection = Depends(get_connection)):
    """Watch the terminal: opened -> (endpoint) -> closed, every request."""
    return {"used": "a connection that will definitely be closed"}


@app.get("/with-cleanup-but-broken")
def broken(conn: FakeConnection = Depends(get_connection)):
    """Still prints 'closed'. That is the guarantee the finally: buys you."""
    raise HTTPException(status.HTTP_418_IM_A_TEAPOT, "deliberate failure")
