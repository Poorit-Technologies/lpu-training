"""async def vs def - what actually happens, without the hand-waving.

Run:   uv run fastapi dev 01_foundations/d5_async_vs_sync.py
Open:  http://127.0.0.1:8000/docs
"""
import asyncio
import time

from fastapi import FastAPI

app = FastAPI(title="Async Demo")


# --- Plain def -------------------------------------------------------------
# FastAPI runs this in a separate thread, so a slow line here does not
# freeze the whole server. Use it for normal code and for libraries that
# have no async version (most database drivers you will meet).
@app.get("/sync")
def slow_sync():
    time.sleep(2)                    # pretend this is a database call
    return {"style": "def", "waited": 2}


# --- async def -------------------------------------------------------------
# While this one waits, the server is free to serve other requests.
# Use it when the library you are calling supports it (httpx, async drivers).
@app.get("/async")
async def slow_async():
    await asyncio.sleep(2)           # pretend this is an API call
    return {"style": "async def", "waited": 2}




# Rule of thumb for this course:
#   Not sure? Use plain def. FastAPI handles it safely.
#   Using an async library? Use async def and await it.
#   Never put a blocking call inside async def.
