# Module 2 — APIs & Databases

REST · full CRUD · error handling · SQL · PostgreSQL · SQLAlchemy.
Notes: [`../../notes/02_APIs_and_Databases.md`](../../notes/02_APIs_and_Databases.md)

> **The SQL half is not here — it's in a notebook.**
> Open [`../../notebooks/02_SQL_Basics.ipynb`](../../notebooks/02_SQL_Basics.ipynb) in Colab.
> Nothing to install, no keys. **Start the database downloading first** (below), then do the
> notebook while it pulls.

Run everything from the `code/` folder (one level up).

## 0 · Start the database — do this first

```bash
docker compose -f 02_apis_and_databases/docker-compose.yml up -d
```

First run downloads ~400 MB. Check it's up, and get a SQL prompt inside it:

```bash
docker compose -f 02_apis_and_databases/docker-compose.yml exec db psql -U lpu -d lpudb
```

## 1 · No database needed

```bash
uv run fastapi dev 02_apis_and_databases/g1_crud_full.py         # PUT, PATCH, DELETE 204, 404/409
uv run fastapi dev 02_apis_and_databases/h1_errors_envelope.py   # one error shape for everything
uv run fastapi dev 02_apis_and_databases/i1_depends.py           # Depends, and the yield shape
```

## 2 · Needs the database running

```bash
uv run fastapi dev 02_apis_and_databases/l1_models_and_session.py   # the same API, on Postgres
uv run python 02_apis_and_databases/m1_relationships.py             # one-to-many, both directions
uv run fastapi dev 02_apis_and_databases/course_api/main.py         # the finished build
```

Then open **http://127.0.0.1:8000/docs**. Stop a server with `Ctrl+C` before starting the next —
they all want port 8000.

**The demo of the day:** add a student, `Ctrl+C` the server, start it again, `GET /students`.
Still there.

## What runs where

| | Where | Needs |
| --- | --- | --- |
| SQL — `CREATE`, `SELECT`, `JOIN` | [the notebook](../../notebooks/02_SQL_Basics.ipynb), in Colab | nothing at all |
| REST, CRUD, errors, `Depends` | here, in VS Code | `uv sync` |
| Postgres, SQLAlchemy, relationships | here, in VS Code | `uv sync` + Docker running |

⚠️ **`m1_relationships.py` drops and recreates `courses` and `students` every run** so it always
works in class. It shares those table names with `course_api/`, so run it *before* you build your
own app, not after.

## When it goes wrong

| Problem | Fix |
| --- | --- |
| `connection refused` on 5432 | The database isn't up. `docker compose ... up -d`, then `ps` to confirm. |
| `docker: command not found` | Docker Desktop isn't installed or isn't running. Start it, then retry. |
| `password authentication failed` | An older Postgres container is still holding port 5432. `docker ps`, stop it, retry. |
| `relation "students" does not exist` | You changed a model. `create_all` never alters an existing table — reset with `docker compose ... down -v` then `up -d`. |
| Data vanished after `down` | You're on an old compose file mounting `/var/lib/postgresql/data`. Postgres **18** needs `/var/lib/postgresql`. |
| `Address already in use` | An earlier server is still running. `Ctrl+C` it, or add `--port 8001`. |
| `ModuleNotFoundError: database` | Run from `code/`, and use the full path — `fastapi dev 02_apis_and_databases/course_api/main.py`. |
