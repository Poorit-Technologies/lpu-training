"""main.py — the app, the CORS rule, and the routers. Nothing else.

Before running:  docker compose -f 03_auth_deploy_ship/docker-compose.yml up -d db
Run:             uv run fastapi dev 03_auth_deploy_ship/secure_api/main.py
Open:            http://127.0.0.1:8000/docs

The demo, in order:
    1. POST /auth/register   {"email": "ada@lpu.in", "password": "lpu-2026-ok", "role": "admin"}
    2. GET  /courses         -> 401. You are not logged in.
    3. Click the PADLOCK, log in with the same email + password
    4. GET  /courses         -> 200. Same endpoint, same you, one token later.
    5. Register a "student" role, log in as them, POST /courses -> 403
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import ask, auth, courses

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Course API",
    description="Module 3 — hashing, JWT, roles, and an AI endpoint behind the same login.",
)

# Every student meets this bug in their capstone: a React app on port 3000 calls
# the API on 8000 and the browser silently blocks it. "*" is fine for class and
# WRONG in production - name the real origins there.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(ask.router)


@app.get("/health", tags=["health"])
def health():
    """Deliberately public — a platform health check has no token to send."""
    return {"status": "ok"}
