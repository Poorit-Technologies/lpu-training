"""Your first API - two endpoints, nothing else.

Run:   uv run fastapi dev 01_foundations/d1_hello_api.py
Open:  http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI

app = FastAPI(title="Hello API")


@app.get("/")               # "when someone sends a GET to this address, run this"
def home():
    return {"message": "Backend is live and runnn"}     # a dict goes out as JSON


@app.get("/health")
def health():
    return {"status": "ok"}


# Three addresses worth opening:
#   /docs          - interactive documentation, generated from your code
#   /redoc         - the same information, laid out for reading
#   /openapi.json  - the machine-readable description the other two are built from
