# 🛠️ Setup Guide — LPU Backend + GenAI Class Code

Everything you need to run the class programs. Do the **one‑time setup** once, then each day just run the files.

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

## 7. Optional — run one block at a time
The plain Python files are split into `# %%` **cells**. Install the **Python** and **Jupyter** extensions in VS Code, and a `Run Cell` link appears above each block — or press `Shift+Enter` to run just the block your cursor is in. Values stay alive between cells, so you can change one line and re-run only that part.

`# %%` is only a comment, so the files still run whole with `uv run python`.

---

## Folder layout
```
code/
├─ pyproject.toml        # packages this project uses
├─ .env.example          # copy to .env, add your keys
├─ 01_foundations/       # Module 1 — Python & OOP, FastAPI, Pydantic
│  ├─ a1..a3             # Python: refresher, type hints, errors + JSON
│  ├─ b1..b5             # OOP: classes, pillars, dunders, composition, dataclass
│  ├─ d1..d7             # FastAPI: endpoints, params, bodies, errors, async, extras
│  ├─ d8_structured_app/ # the same API split into routers
│  ├─ e1..e4             # Pydantic: basics, Field rules, validators, types
│  └─ student_api.py     # the finished app
├─ ai_scripts/           # GenAI ideas in plain Python (no notebook needed)
│  ├─ 01_pydantic_classes.py   # classes + Pydantic (offline)
│  ├─ 02_openai_call.py
│  ├─ 03_gemini_via_openai.py
│  ├─ 04_litellm_demo.py
│  └─ 05_structured_output.py
└─ (02_…, 03_…, added as we go)
```
