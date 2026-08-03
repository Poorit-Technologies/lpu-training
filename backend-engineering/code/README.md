# LPU Class Code — how to run

Full machine setup (install uv, Python, keys) → see [../SETUP.md](../SETUP.md).
Already set up? From this `code/` folder run `uv sync` once, then use the commands below.

> Every command runs **from this folder**. From anywhere else you get `Failed to spawn: fastapi`.

## Module 1 — Backend Foundations

The full file-by-file list is in [`01_foundations/README.md`](01_foundations/README.md).

> Python, OOP and Pydantic live in
> [`../notebooks/01_Python_Refresher.ipynb`](../notebooks/01_Python_Refresher.ipynb) — Colab, nothing
> to install. This project is the FastAPI half.

```bash
uv run fastapi dev 01_foundations/student_api.py
```

Plain scripts (`a*`, `b*`, `e*`) run and exit. Server files (`d*`, `student_api.py`) keep running — open **http://127.0.0.1:8000/docs**, and press `Ctrl+C` before starting the next one.

The plain scripts are split into `# %%` cells: in VS Code press `Shift+Enter` to run one block at a time instead of the whole file.

## GenAI in plain Python

Notebook-free versions of the Week 1 ideas.

```bash
uv run python ai_scripts/01_pydantic_classes.py
```

```bash
uv run python ai_scripts/02_openai_call.py
```

`01_pydantic_classes.py` needs no key. `02_openai_call.py` and `05_structured_output.py` need `OPENAI_API_KEY`, `03_gemini_via_openai.py` needs `GEMINI_API_KEY`, and `04_litellm_demo.py` needs whichever provider you point it at.

> "Model not found"? Edit the model string in the script (e.g. `gpt-5.6`, `gemini-3.6-flash`) to a current id.
