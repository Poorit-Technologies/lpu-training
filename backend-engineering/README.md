# Backend Engineering — Week 2 (Days 6–10)

The backend half of the course. Unlike Week 1, this runs **locally on your own machine** in VS Code — not in Colab.

## Folders

| Folder | What's in it |
| --- | --- |
| [`code/`](code/) | The runnable project — one [uv](https://docs.astral.sh/uv/) workspace, a folder per day. |
| [`notes/`](notes/) | Detailed written notes for each day — use these for revision. |
| [`SETUP.md`](SETUP.md) | One-time machine setup: install uv, Python, packages, API keys. |

## First-time setup

Do this once. Full step-by-step (with Windows commands) is in **[SETUP.md](SETUP.md)**.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then, from inside the `code/` folder:

```bash
cd code
uv sync
```

`uv sync` reads `pyproject.toml` and sets up a virtual environment with FastAPI, Pydantic, OpenAI and LiteLLM automatically. There's no `pip install` and no `activate` step.

For scripts that call a model, add your keys:

```bash
cp .env.example .env
```

> `.env` is git-ignored. Never commit it.

## Running the code

All commands run from `backend-engineering/code/`.

```bash
# OOP basics — no API key needed
uv run python Day01/backend/oop_demo.py

# FastAPI app — then open http://127.0.0.1:8000/docs
uv run fastapi dev Day01/backend/main.py
```

## Day index

| Day | Topic | Material |
| --- | --- | --- |
| 6 | Python OOP + FastAPI foundations — path & query params, Pydantic models, auto-generated `/docs` | [notes](notes/Day_01_Backend.md) · [`code/Day01/`](code/Day01/) |
| 7 | REST API design · full CRUD · validation · error handling | *coming soon* |
| 8 | Databases — SQL, PostgreSQL, SQLAlchemy ORM, relationships | *coming soon* |
| 9 | Auth & security (JWT, RBAC) · Docker · caching & architecture | *coming soon* |
| 10 | Deployment · capstone project · demo & viva | *coming soon* |

## A note on `code/Day01/ai/`

The `code/Day01/ai/` folder holds plain-Python versions of the Day 1 GenAI ideas — calling OpenAI, calling Gemini through the OpenAI client, LiteLLM, and structured output with Pydantic. They're here because they share this project's dependencies and are handy when you want to run the same concepts outside Colab. The Week 1 teaching material itself lives in [`../generative-ai/`](../generative-ai/).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `uv: command not found` | Close and reopen your terminal after installing uv. |
| `model not found` | Model IDs change often — edit the model string in the script to a current one. |
| Port 8000 already in use | Stop the other server, or run with `--port 8001`. |
| Missing key errors | Check that `.env` exists in `code/` and contains your key. |
