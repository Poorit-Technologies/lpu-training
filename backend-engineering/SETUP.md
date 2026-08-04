# 🛠️ Setup Guide — LPU Backend + GenAI Class Code

Everything you need to run the class programs. Do the **one‑time setup** once, then each day just run the files.

> ### 📓 First — half of Module 1 needs none of this
> **Python, OOP and Pydantic** run in Colab: [`notebooks/01_Python_Refresher.ipynb`](notebooks/01_Python_Refresher.ipynb) —
> nothing to install, no API key, works on any laptop. This guide is for the half that **starts a server** (FastAPI onwards).
>
> **Best order:** kick off `uv sync` (step 4) and leave it downloading, then open the notebook and work
> through it while it finishes. Your machine will be ready by the time you need it.

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

## 7. Running one piece at a time
The `01_foundations/` files **start a server**, so there is nothing to run line by line. `/docs` is where you
try one thing at a time: open **http://127.0.0.1:8000/docs** and click *Try it out* on a single endpoint.
`fastapi dev` reloads on save, so edit the file, save, and refresh — no restart.

Want to change one line and re-run just that bit? That's the **notebook**
([`01_Python_Refresher.ipynb`](notebooks/01_Python_Refresher.ipynb)) — every cell runs on its own and values
stay alive between them.

---

## Folder layout
```
backend-engineering/
├─ notebooks/
│  └─ 01_Python_Refresher.ipynb   # Python · OOP · Pydantic — Colab, nothing to install
└─ code/                          # ← everything below needs the setup in this guide
   ├─ pyproject.toml              # packages this project uses
   ├─ .env.example                # copy to .env, add your keys
   ├─ 01_foundations/             # Module 1 — FastAPI
   │  ├─ d1..d7                   # endpoints, params, bodies, errors, async, extras
   │  ├─ d8_structured_app/       # the same API split into routers
   │  ├─ student_api.py           # the finished app
   │  └─ README.md                # what each file shows + the command for it
   ├─ ai_scripts/                 # GenAI ideas in plain Python (no notebook needed)
   │  ├─ 01_pydantic_classes.py   # classes + Pydantic (offline)
   │  ├─ 02_openai_call.py
   │  ├─ 03_gemini_via_openai.py
   │  ├─ 04_litellm_demo.py
   │  └─ 05_structured_output.py
   └─ (02_…, 03_…, added as we go)
```
