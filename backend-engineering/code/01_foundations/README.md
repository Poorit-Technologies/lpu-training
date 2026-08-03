# Module 1 — Backend Foundations

Python & OOP · FastAPI · Pydantic. Notes: [`../../notes/01_Foundations.md`](../../notes/01_Foundations.md)

Run everything from the `code/` folder (one level up). Do `uv sync` once, then:

## Two ways to run the plain Python files

**Whole file** — the commands below. Runs top to bottom, prints, exits.

**One block at a time** — every plain script is split into **cells** marked `# %%`. In VS Code a **`Run Cell`** link appears above each block; click it, or press `Shift+Enter`, and only that block runs. Output opens in a pane beside the code and **values stay alive between cells**, so you can run the class definition, then poke at the object on its own, change one line and re-run just that bit.

`# %%` is only a comment — the file still runs whole exactly as before.

Needs the **Python** and **Jupyter** extensions in VS Code (`ipykernel` is already in this project). The first time you run a cell, pick the interpreter under `code/.venv`.

The `d*` server files have no cells — `/docs` already lets you run one endpoint at a time.

## A · Python — no server, no keys

```bash
uv run python 01_foundations/a1_refresher.py        # collections, functions, gotchas
uv run python 01_foundations/a2_type_hints.py       # hints, and why FastAPI cares
uv run python 01_foundations/a3_errors_and_json.py  # try/except/raise, and JSON
```

## B · OOP — no server, no keys

```bash
uv run python 01_foundations/b1_classes.py                # class, object, self
uv run python 01_foundations/b2_pillars.py                # the 4 pillars
uv run python 01_foundations/b3_dunders_and_property.py   # __str__, __eq__, @property
uv run python 01_foundations/b4_composition.py            # has-a vs is-a, ABCs
uv run python 01_foundations/b5_dataclass.py              # @dataclass
```

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

## E · Pydantic — no server

```bash
uv run python 01_foundations/e1_basics.py               # BaseModel, coercion, errors
uv run python 01_foundations/e2_field_constraints.py    # Field() rules
uv run python 01_foundations/e3_validators.py           # field_validator, model_validator
uv run python 01_foundations/e4_types_nested_config.py  # EmailStr, Enum, nested, ConfigDict
```

## The finished app

```bash
uv run fastapi dev 01_foundations/student_api.py
```

Then open **http://127.0.0.1:8000/docs** and click *Try it out*. Stop a server with `Ctrl+C` before starting the next — they all want port 8000.

| Problem | Fix |
| --- | --- |
| `Address already in use` | An earlier server is still running. `Ctrl+C` it, or add `--port 8001`. |
| `uv: command not found` | Close and reopen your terminal after installing uv. |
| Changes don't show up | `fastapi dev` reloads on save — check you saved, and watch the terminal for a syntax error. |
| `Failed to spawn: fastapi` | You're in the wrong folder, or the venv is stale. Run from `code/`; if it persists, delete `.venv` and run `uv sync`. |
| `email-validator is not installed` | `uv sync` again — it's in `pyproject.toml`. |
