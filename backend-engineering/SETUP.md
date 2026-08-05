# 🛠️ Setup Guide — LPU Backend + GenAI Class Code

Everything you need to run the class programs. Do the **one‑time setup** once, then each day just run the files.

> ### 📓 START HERE — most of this course needs none of this
>
> **Five Colab notebooks. Nothing to install, no API key, no database.** They run on a laptop or a
> phone, and they cover almost everything taught in class. Do these first, in order:
>
> | | Notebook | What you build |
> |---|---|---|
> | 1 | [Python & OOP Refresher](notebooks/01_Python_Refresher.ipynb) | classes, the four pillars, Pydantic |
> | 2 | [SQL Basics](notebooks/02_SQL_Basics.ipynb) | tables, `SELECT … WHERE`, `JOIN`, foreign keys |
> | 3 | [FastAPI & CRUD](notebooks/02_FastAPI_CRUD.ipynb) | a real API — all four verbs, 404/409/422 |
> | 4 | [SQLAlchemy & Relationships](notebooks/02_SQLAlchemy_Relationships.ipynb) | classes become tables, data survives |
> | 5 | [Auth — Hashing, JWT & Roles](notebooks/03_Auth_JWT.ipynb) | a login that issues tokens |
>
> Notebooks 3 and 5 run a **real FastAPI app with no server at all**, using `TestClient`. That is why
> they need no setup — and the code is identical to what you would deploy.
>
> **The rest of this guide is for running it properly on your own machine.** You need that for two
> things only: **Docker/PostgreSQL** (§8) and **deploying** ([DEPLOY.md](DEPLOY.md)). Everything else
> you can already do in Colab.
>
> **Best order:** kick off `uv sync` (step 4) and leave it downloading, then work through the
> notebooks while it finishes.

## 0. What you'll install (high level)
1. **uv** — the modern tool that manages Python, virtual environments, and packages (replaces `pip` + `venv`; much faster). It can even install Python for you.
2. **Python 3.14** — the language (installed via uv).
3. The project's **packages** (FastAPI, OpenAI, LiteLLM, Pydantic) — installed automatically from `pyproject.toml`.
4. **API keys** (OpenAI / Gemini) — only needed for the AI scripts that call a model.

---

## 1. Install uv (one time)
**macOS / Linux** — open Terminal:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
**Windows** — open PowerShell:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
Close and reopen your terminal, then check it worked:
```bash
uv --version
```
> Prefer the manual route? You can instead download Python 3.14 from https://www.python.org/downloads/ — but uv is the easy path.

## 2. Install Python 3.14 (via uv)
```bash
uv python install 3.14
```

## 3. Get / create the project folder
If you were given the `code/` folder, just open a terminal **inside it**:
```bash
cd path/to/code
```
Starting from scratch instead?
```bash
uv init lpu-code
cd lpu-code
```

## 4. Install the packages (one time)
From inside the `code/` folder:
```bash
uv sync
```
This reads `pyproject.toml` and installs FastAPI, OpenAI, LiteLLM, and Pydantic into a local virtual environment — automatically. No `pip install`, no `activate` step.

## 5. Add your API keys (only for the AI scripts)
Copy the template, then paste your keys into the new `.env`:
```bash
cp .env.example .env
```
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```
- OpenAI keys → https://platform.openai.com/api-keys
- Gemini keys → https://aistudio.google.com/apikey

> ⚠️ Never share `.env` or commit it to GitHub. (`.gitignore` already blocks it.)

---

## 6. Check it works
### Backend
```bash
# The project is ready when this prints a version
uv run python -c "import fastapi; print('FastAPI', fastapi.__version__)"

# FastAPI app — then open http://127.0.0.1:8000/docs
uv run fastapi dev 01_foundations/d1_hello_api.py
```
Press `Ctrl+C` to stop a server. Every file in the module, with what it demonstrates, is listed in `01_foundations/README.md`.

**Modules 2 and 3** need the database running first — see **§8**. Once it is up:
```bash
# Module 2 — the API on PostgreSQL (add a course, restart the server, it is still there)
uv run fastapi dev 02_apis_and_databases/course_api/main.py

# Module 3 — the same API behind a login
uv run fastapi dev 03_auth_deploy_ship/secure_api/main.py
```
Full file-by-file lists: [`02_apis_and_databases/README.md`](code/02_apis_and_databases/README.md) ·
[`03_auth_deploy_ship/README.md`](code/03_auth_deploy_ship/README.md)

### AI
```bash
# Python building blocks — no API key needed
uv run python ai_scripts/01_pydantic_classes.py

# Call OpenAI            (needs OPENAI_API_KEY)
uv run python ai_scripts/02_openai_call.py

# Call Gemini via OpenAI client   (needs GEMINI_API_KEY)
uv run python ai_scripts/03_gemini_via_openai.py

# One interface, many providers   (needs the matching keys)
uv run python ai_scripts/04_litellm_demo.py

# Structured output → Pydantic     (needs OPENAI_API_KEY)
uv run python ai_scripts/05_structured_output.py
```

> **Got a "model not found" error?** Model IDs change often. Open the script and change the model string (e.g. `gpt-5.6`, `gemini-3.6-flash`) to a current one from the provider's docs.

---

## 7. Running one piece at a time
The `01_foundations/` files **start a server**, so there is nothing to run line by line. `/docs` is where you
try one thing at a time: open **http://127.0.0.1:8000/docs** and click *Try it out* on a single endpoint.
`fastapi dev` reloads on save, so edit the file, save, and refresh — no restart.

Want to change one line and re-run just that bit? That's the **notebooks** — every cell runs on its
own and values stay alive between them. That is the fastest way to experiment.

---

## 8. Docker — the database (Modules 2 and 3)

Modules 2 and 3 need **PostgreSQL**. You do not install it: you run a prepared copy in a container.

**Install Docker Desktop** → https://www.docker.com/products/docker-desktop — then start it and
leave it running (you should see the whale icon).

From inside `code/`:

```bash
docker compose -f 02_apis_and_databases/docker-compose.yml up -d
```

That is the entire database installation. The first run downloads ~400 MB. Check it worked:

```bash
docker compose -f 02_apis_and_databases/docker-compose.yml ps
```

To get a SQL prompt inside it and run the queries from the SQL notebook for real:

```bash
docker compose -f 02_apis_and_databases/docker-compose.yml exec db psql -U lpu -d lpudb
```

| Command | What it does |
| --- | --- |
| `up -d` | start it in the background |
| `down` | stop it, **keep** your data |
| `down -v` | stop it and **delete** the data — a clean slate |

> 🚨 **The error you will hit, and the fix.** If you change a model (add a column, rename a field) and
> then see `column ... does not exist` or `relation ... does not exist`, it is because
> `create_all` only ever **creates missing tables — it never alters an existing one**. In a real
> project you would write a migration. While learning, just reset:
>
> ```bash
> docker compose -f 02_apis_and_databases/docker-compose.yml down -v && docker compose -f 02_apis_and_databases/docker-compose.yml up -d
> ```

**Module 3** adds Redis alongside Postgres — same idea, its own compose file:

```bash
docker compose -f 03_auth_deploy_ship/docker-compose.yml up -d db redis
```

### When Docker goes wrong

| Problem | Fix |
| --- | --- |
| `docker: command not found` | Docker Desktop is not installed, or not started. Start it and wait for the whale icon. |
| `Cannot connect to the Docker daemon` | Docker Desktop is installed but not running. |
| `port is already allocated` | Something else holds 5432 (often a local Postgres). Change the **left** number in the compose file to `5433:5432`, and the port in `DATABASE_URL` to match. |
| `connection refused` on 5432 from Python | The container is not up. `... ps` to check, `... up -d` to start. |
| Data vanished after `down` | You used `down -v`, which deletes it on purpose. |

---

## Folder layout
```
backend-engineering/
├─ notebooks/                     # ← START HERE. Colab, nothing to install.
│  ├─ 01_Python_Refresher.ipynb          # Python · OOP · Pydantic
│  ├─ 02_SQL_Basics.ipynb                # SQL on SQLite
│  ├─ 02_FastAPI_CRUD.ipynb              # a real API, no server (TestClient)
│  ├─ 02_SQLAlchemy_Relationships.ipynb  # classes as tables, on SQLite
│  └─ 03_Auth_JWT.ipynb                  # hashing, tokens, roles
├─ notes/                         # the full written notes, one per module
├─ DEPLOY.md                      # put it on the internet, get a public URL
└─ code/                          # ← everything below needs the setup in this guide
   ├─ pyproject.toml              # packages this project uses
   ├─ .env.example                # copy to .env, add your keys
   ├─ 01_foundations/             # Module 1 — FastAPI
   │  ├─ d1..d7                   # endpoints, params, bodies, errors, async, extras
   │  ├─ d8_structured_app/       # the same API split into routers
   │  ├─ student_api.py           # the finished app
   │  └─ README.md                # what each file shows + the command for it
   ├─ 02_apis_and_databases/      # Module 2 — CRUD, SQL, PostgreSQL  (needs Docker)
   │  ├─ docker-compose.yml       # the database, in one command
   │  ├─ g1 · h1 · i1             # full CRUD · one error shape · Depends
   │  ├─ l1 · m1                  # the API on Postgres · relationships
   │  └─ course_api/              # the finished Module 2 app
   ├─ 03_auth_deploy_ship/        # Module 3 — auth, Docker, deploy  (needs Docker)
   │  ├─ n1 · n2 · p1             # hashing · JWT · Redis caching
   │  ├─ Dockerfile               # the API itself, in a box
   │  ├─ docker-compose.yml       # api + db + redis together
   │  └─ secure_api/              # the finished app, behind a login
   └─ ai_scripts/                 # GenAI ideas in plain Python (no notebook needed)
      ├─ 01_pydantic_classes.py   # classes + Pydantic (offline)
      ├─ 02_openai_call.py
      ├─ 03_gemini_via_openai.py
      ├─ 04_litellm_demo.py
      └─ 05_structured_output.py
```
