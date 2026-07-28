# LPU Class Code — how to run

Full machine setup (install uv, Python, keys) → see [../SETUP.md](../SETUP.md).
Already set up? From this `code/` folder run `uv sync` once, then:

## Day 1 — Backend
```bash
uv run python Day01/backend/oop_demo.py        # OOP basics (offline)
uv run fastapi dev Day01/backend/main.py       # API → http://127.0.0.1:8000/docs
```

## Day 1 — AI
```bash
uv run python Day01/ai/01_pydantic_classes.py  # offline
uv run python Day01/ai/02_openai_call.py       # needs OPENAI_API_KEY
uv run python Day01/ai/03_gemini_via_openai.py # needs GEMINI_API_KEY
uv run python Day01/ai/04_litellm_demo.py      # needs matching keys
uv run python Day01/ai/05_structured_output.py # needs OPENAI_API_KEY
```

> "Model not found"? Edit the model string in the script (e.g. `gpt-5.6`, `gemini-3.6-flash`) to a current id.
