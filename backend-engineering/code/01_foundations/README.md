# Module 1 — Backend Foundations

FastAPI, run locally. Notes: [`../../notes/01_Foundations.md`](../../notes/01_Foundations.md)

> **Python, OOP and Pydantic are not here — they're in a notebook.**
> Open [`../../notebooks/01_Python_Refresher.ipynb`](../../notebooks/01_Python_Refresher.ipynb) in
> Colab. Nothing to install, no keys. Kick off `uv sync` below first, then work through the notebook
> while it downloads.

Run everything from the `code/` folder (one level up). Do `uv sync` once, then:

## D · FastAPI — each one starts a server

```bash
uv run fastapi dev 01_foundations/d1_hello_api.py                  # first endpoints, /docs
uv run fastapi dev 01_foundations/d2_params.py                     # path + query params
uv run fastapi dev 01_foundations/d3_body_and_status.py            # POST, 201, response_model
uv run fastapi dev 01_foundations/d4_errors.py                     # HTTPException vs returning
uv run fastapi dev 01_foundations/d5_async_vs_sync.py              # async def vs def
uv run fastapi dev 01_foundations/d6_depends.py                    # dependency injection
uv run fastapi dev 01_foundations/d7_middleware_and_background.py  # middleware, background tasks
uv run fastapi dev 01_foundations/d8_structured_app/main.py        # split into routers
```

## The finished app

```bash
uv run fastapi dev 01_foundations/student_api.py
```

Then open **http://127.0.0.1:8000/docs** and click *Try it out*. Stop a server with `Ctrl+C` before
starting the next — they all want port 8000.

## What runs where

| | Where | Needs |
| --- | --- | --- |
| Python · OOP · Pydantic | [the notebook](../../notebooks/01_Python_Refresher.ipynb), in Colab | nothing at all |
| FastAPI | here, in VS Code | `uv sync`, a terminal |

The `d*` files start a server, so there is nothing to run cell by cell — `/docs` already lets you try
one endpoint at a time.

| Problem | Fix |
| --- | --- |
| `Address already in use` | An earlier server is still running. `Ctrl+C` it, or add `--port 8001`. |
| `uv: command not found` | Close and reopen your terminal after installing uv. |
| Changes don't show up | `fastapi dev` reloads on save — check you saved, and watch the terminal for a syntax error. |
| `Failed to spawn: fastapi` | You're in the wrong folder, or the venv is stale. Run from `code/`; if it persists, delete `.venv` and run `uv sync`. |
| `email-validator is not installed` | `uv sync` again — it's in `pyproject.toml`. |
