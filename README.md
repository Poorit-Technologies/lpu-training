# LPU Training — Backend Development + Generative AI

Course materials for the **Backend Development + Generative AI** programme at **Lovely Professional University**, delivered by [Poorit Technologies](https://github.com/Poorit-Technologies).

**Format:** 10 days · 3 hours/day · 2 weeks
**Week 1 — Generative AI** (run in Google Colab) · **Week 2 — Backend Engineering** (run locally in VS Code) + capstone project

---

## Repository layout

```
lpu-training/
├── generative-ai/            ← Week 1 · Days 1–5
│   ├── notebooks/            Colab notebooks — the main class material
│   ├── exercises/            practice notebooks (fill-in-the-blank)
│   ├── slides/               class decks (.pptx)
│   └── notes/                detailed written notes per day
│
└── backend-engineering/      ← Week 2 · Days 6–10
    ├── code/                 runnable uv project (FastAPI, Python)
    ├── notes/                detailed written notes per day
    └── SETUP.md              one-time machine setup guide
```

New material is added here as the course progresses — check back after each class.

---

## Week 1 — Generative AI

Taught entirely in **Google Colab**. Nothing to install: open the notebook, add your API key when prompted, run the cells.

| Day | Topic | Material |
| --- | --- | --- |
| 1 | GenAI foundations — how LLMs work, tokens & context windows, calling OpenAI / Gemini / LiteLLM, structured output, prompting basics, failure modes | [notebook](generative-ai/notebooks/Day01_AI.ipynb) · [exercises](generative-ai/exercises/Day01_Exercises.ipynb) · [slides](generative-ai/slides/Day01_GenAI.pptx) · [notes](generative-ai/notes/Day_01_AI.md) |
| 2 | Advanced prompting (zero/few-shot, chain-of-thought) · function calling & tools · LLM parameters · streaming · Gradio UIs | [notebook](generative-ai/notebooks/Day02_AI.ipynb) · [gradio](generative-ai/notebooks/Day02_Gradio.ipynb) · [exercises](generative-ai/exercises/Day02_Exercises.ipynb) · build-it-yourself: [2a word counter](generative-ai/exercises/Day02a_WordCounter.ipynb) · [2b pamphlet generator](generative-ai/exercises/Day02b_PamphletGenerator.ipynb) · [2c chatbot](generative-ai/exercises/Day02c_ChatInterface.ipynb) · [slides](generative-ai/slides/Day02_GenAI.pptx) · [notes](generative-ai/notes/Day_02_AI.md) |
| 3 | Embeddings · cosine similarity · visualising the space · chunking strategies · vector databases (Chroma) · a semantic search engine + a first taste of RAG | [notebook](generative-ai/notebooks/Day03_AI.ipynb) · [exercise](generative-ai/exercises/Day03_Exercises.ipynb) · build-it-yourself: [3a embedding explorer](generative-ai/exercises/Day03a_EmbeddingExplorer.ipynb) · [3b document Q&A](generative-ai/exercises/Day03b_DocumentQA.ipynb) · [slides](generative-ai/slides/Day03_GenAI.pptx) · [notes](generative-ai/notes/Day_03_AI.md) |
| 4 | RAG end to end — LangChain & LCEL · `RunnableLambda` over your own retriever · grounding and "I don't know" · citations from metadata · fixing retrieval · measuring it · a Gradio chat app | [notebook](generative-ai/notebooks/Day04_AI.ipynb) · build-it-yourself: [4a chat with your own PDF](generative-ai/exercises/Day04a_PDFChatbot.ipynb) · [slides](generative-ai/slides/Day04_GenAI.pptx) · [notes](generative-ai/notes/Day_04_AI.md) |
| 5 | Agents — **three notebooks, run in order.** Tool calls from scratch · the agent loop · your document search becomes a tool · cost · structured output & LLM-as-judge · prompt injection and approval gates — then **LangGraph** (state, nodes, conditional edges, `ToolNode`, memory, pause & resume) and **CrewAI** (role/goal/backstory, single agent, multi-agent crew) | [1 tools & agents](generative-ai/notebooks/Day05_1_ToolsAndAgents.ipynb) · [2 LangGraph](generative-ai/notebooks/Day05_2_LangGraph.ipynb) · [3 CrewAI](generative-ai/notebooks/Day05_3_CrewAI.ipynb) · build-it-yourself: [5a research agent](generative-ai/exercises/Day05a_ResearchAgent.ipynb) · [slides](generative-ai/slides/Day05_GenAI.pptx) · [notes](generative-ai/notes/Day_05_AI.md) |

**Revision — [Five Ways to Call a Model](generative-ai/exercises/API_Calls_Exercises.ipynb):** a cross-day practice notebook. The same job through five different front doors — the `openai` client (OpenAI *and* Gemini), LiteLLM `completion()`, LiteLLM `embedding()` with `text-embedding-3-small`, the local `all-MiniLM-L6-v2` embedder, and LangChain's `ChatOpenAI` / `ChatGoogleGenerativeAI`.

**Bonus demo — [Kcal Snap](generative-ai/notebooks/Demo_CalorieCounter_AI.ipynb):** upload a food photo, get calories and macros back, served through a live Gradio link you can open on your phone. A complete multimodal + structured-output app in a few lines.

### Running a notebook
1. Open the `.ipynb` file above and click **Open in Colab** (or upload it to [colab.research.google.com](https://colab.research.google.com)).
2. Get an API key — [OpenAI](https://platform.openai.com/api-keys) or [Google AI Studio](https://aistudio.google.com/apikey) (free tier available).
3. Run the cells top to bottom. Keys are entered with `getpass`, so they are never saved into the notebook.

> Never paste an API key directly into a code cell, and never commit one to GitHub.

---

## Week 2 — Backend Engineering

Taught **locally in VS Code** using the [`backend-engineering/code/`](backend-engineering/code/) project, managed with [uv](https://docs.astral.sh/uv/).

| Day | Topic | Material |
| --- | --- | --- |
| 6 | Python OOP + FastAPI foundations — path & query params, Pydantic models, `/docs` | [notes](backend-engineering/notes/Day_01_Backend.md) · [code](backend-engineering/code/Day01/) |
| 7 | REST API design · full CRUD · validation · error handling | *coming soon* |
| 8 | Databases — SQL, PostgreSQL, SQLAlchemy ORM, relationships | *coming soon* |
| 9 | Auth & security (JWT, RBAC) · Docker · caching & architecture | *coming soon* |
| 10 | Deployment · **capstone project** (backend + a GenAI feature) · demo & viva | *coming soon* |

### Quick start
Full instructions, including installing uv and Python, are in **[backend-engineering/SETUP.md](backend-engineering/SETUP.md)**.

```bash
cd backend-engineering/code
uv sync
uv run fastapi dev Day01/backend/main.py   # then open http://127.0.0.1:8000/docs
```

For the scripts that call a model, copy the key template first:

```bash
cp backend-engineering/code/.env.example backend-engineering/code/.env
```

---

## Capstone project

The final project combines both weeks: a FastAPI backend with a real GenAI feature. Options include a résumé analyser, a healthcare RAG chatbot, an AI coding assistant, or a smart learning assistant.

---

## Notes

- Model IDs change often. If a script or cell fails with *"model not found"*, swap the model string for a current one from the provider's docs.
- API keys are personal — keep them out of notebooks, out of screenshots, and out of Git. `.env` is already ignored here.
