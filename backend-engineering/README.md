# Backend Engineering — Week 2

The backend half of the course. Unlike Week 1, this runs **locally on your own machine** in VS Code — not in Colab.

Three modules, three hours each. They build **one app**: it starts as objects and a handful of endpoints, and ends up containerised, behind a login, on a real database, at a public URL.

## Folders

| Folder | What's in it |
| --- | --- |
| [`code/`](code/) | The runnable project — one [uv](https://docs.astral.sh/uv/) workspace, a folder per module. |
| [`notes/`](notes/) | Detailed written notes per module — use these for revision. |
| [`slides/`](slides/) | The class decks (`.pptx`). |
| [`SETUP.md`](SETUP.md) | One-time machine setup: install uv, Python, packages, API keys. |

## First-time setup

Do this once. Full step-by-step (with Windows commands) is in **[SETUP.md](SETUP.md)**.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then, from inside the `code/` folder:

```bash
uv sync
```

`uv sync` reads `pyproject.toml` and sets up a virtual environment with FastAPI, Pydantic, OpenAI and LiteLLM automatically. There's no `pip install` and no `activate` step.

For scripts that call a model, add your keys:

```bash
cp .env.example .env
```

> `.env` is git-ignored. Never commit it.

## Module index

| # | Topic | Material |
| --- | --- | --- |
| 1 | **Backend Foundations** — Python & OOP · FastAPI (path & query params, request bodies, status codes, errors, `async` vs `def`) · Pydantic validation | [notes](notes/01_Foundations.md) · [code](code/01_foundations/) · [slides](slides/01_Foundations.pptx) |
| 2 | **APIs & Databases** — REST design · full CRUD (PUT/PATCH/DELETE) · error handling · `Depends` & `APIRouter` · SQL · PostgreSQL · SQLAlchemy ORM · relationships | *coming soon* |
| 3 | **Auth, Docker & Deploy** — hashing & JWT · RBAC · security · Redis caching · Docker · deployment · an AI endpoint | *coming soon* |

## Running the code

> **Python, OOP and Pydantic are in a notebook, not here** —
> [`notebooks/01_Python_Refresher.ipynb`](notebooks/01_Python_Refresher.ipynb) runs in Colab with
> nothing installed. This project is for the FastAPI half.

All commands run from `backend-engineering/code/`. Server files stay running until you press `Ctrl+C`:

```bash
uv run fastapi dev 01_foundations/student_api.py
```

Then open **http://127.0.0.1:8000/docs**. Every module folder has its own README listing each file and what it demonstrates — see [`code/01_foundations/README.md`](code/01_foundations/README.md).

> **Tip:** the plain Python files are split into `# %%` cells, so in VS Code you can run one block at a time with `Shift+Enter` instead of the whole file. Needs the Python and Jupyter extensions.

## A note on `code/ai_scripts/`

[`code/ai_scripts/`](code/ai_scripts/) holds plain-Python versions of the Week 1 GenAI ideas — calling OpenAI, calling Gemini through the OpenAI client, LiteLLM, and structured output with Pydantic. They live here because they share this project's dependencies, and they're handy when you want to run those concepts outside Colab. The Week 1 teaching material itself is in [`../generative-ai/`](../generative-ai/).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `uv: command not found` | Close and reopen your terminal after installing uv. |
| `Failed to spawn: fastapi` | You're in the wrong folder — run from `code/`. If it persists, delete `.venv` and run `uv sync`. |
| `model not found` | Model IDs change often — edit the model string in the script to a current one. |
| Port 8000 already in use | Stop the other server with `Ctrl+C`, or run with `--port 8001`. |
| Missing key errors | Check that `.env` exists in `code/` and contains your key. |
