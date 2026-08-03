"""Middleware (runs on EVERY request) and background tasks (run AFTER the answer).

Run:   uv run fastapi dev 01_foundations/d7_middleware_and_background.py
Open:  http://127.0.0.1:8000/docs
"""
import time

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Middleware and Background Demo")


# =========================================================================
# MIDDLEWARE - a wrapper around every single request.
#   request -> [middleware] -> your endpoint -> [middleware] -> response
# =========================================================================
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)          # run the actual endpoint
    elapsed = time.perf_counter() - started
    response.headers["X-Process-Time"] = f"{elapsed:.4f}"
    print(f"{request.method} {request.url.path} took {elapsed:.4f}s")
    return response


# Ready-made middleware: CORS decides which websites may call this API from
# a browser. Without it, a React app on another port is blocked.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],     # "*" in class, never in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================================
# BACKGROUND TASKS - answer the caller now, do the slow bit afterwards.
# =========================================================================
def write_log(message: str):
    time.sleep(2)                                # pretend this is sending an email
    print("LOG:", message, flush=True)


@app.post("/signup")
def signup(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_log, f"welcome email queued for {email}")
    return {"message": "signed up"}      # returns immediately; the log runs after


@app.get("/")
def home():
    return {"message": "check the response headers for X-Process-Time"}


# The signup response comes back instantly. Watch the terminal - "LOG:" appears
# two seconds later. The user never waited for it.
