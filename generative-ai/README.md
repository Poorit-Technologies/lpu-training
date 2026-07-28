# Generative AI — Week 1 (Days 1–5)

Everything for the GenAI half of the course. **Runs in Google Colab — nothing to install.**

## Folders

| Folder | What's in it |
| --- | --- |
| [`notebooks/`](notebooks/) | The main class notebooks. This is what we run together in class. |
| [`exercises/`](exercises/) | Practice notebooks — fill in the `___` blanks yourself. |
| [`slides/`](slides/) | Class decks (`.pptx`) used during the session. |
| [`notes/`](notes/) | Detailed written notes for each day — use these for revision. |

## How to run a notebook

1. Click a notebook below, then hit **Open in Colab** — or upload the `.ipynb` to [colab.research.google.com](https://colab.research.google.com).
2. Get a free API key: [OpenAI](https://platform.openai.com/api-keys) or [Google AI Studio](https://aistudio.google.com/apikey).
3. Run the cells top to bottom. The notebook asks for your key with `getpass`, so it is never written into the file.

> Keys are personal. Don't type one into a code cell, don't share it, don't commit it.

## Day index

### Day 1 — GenAI foundations
How LLMs actually work (tokens, next-token prediction, context windows, hallucination), calling OpenAI and Gemini from Python, using LiteLLM as one interface for many providers, structured output with Pydantic, and prompting basics.

- Notebook: [`Day01_AI.ipynb`](notebooks/Day01_AI.ipynb)
- Exercises: [`Day01_Exercises.ipynb`](exercises/Day01_Exercises.ipynb)
- Slides: [`Day01_GenAI.pptx`](slides/Day01_GenAI.pptx)
- Notes: [`Day_01_AI.md`](notes/Day_01_AI.md)

### Day 2 — Prompting, tools, streaming & UIs
Zero-shot / few-shot / chain-of-thought prompting, function calling and tool use, the parameters that shape a response (`temperature`, `max_tokens`, `top_p`, penalties), streaming responses, and wrapping a model in a Gradio interface.

- Notebook: [`Day02_AI.ipynb`](notebooks/Day02_AI.ipynb)
- Gradio bonus: [`Day02_Gradio.ipynb`](notebooks/Day02_Gradio.ipynb)
- Slides: [`Day02_GenAI.pptx`](slides/Day02_GenAI.pptx)
- Notes: [`Day_02_AI.md`](notes/Day_02_AI.md)

### Day 3 — Embeddings & vector search
Why keyword search fails on meaning, turning text into embeddings, measuring closeness with cosine similarity, chunking documents (and what bad boundaries destroy), storing and filtering vectors in Chroma, then assembling the full index → embed → store → search pipeline and finishing with RAG in five lines.

- Notebook: [`Day03_AI.ipynb`](notebooks/Day03_AI.ipynb)
- Slides: [`Day03_GenAI.pptx`](slides/Day03_GenAI.pptx)
- Notes: [`Day_03_AI.md`](notes/Day_03_AI.md)

> No OpenAI key? Section 3 of the notebook has a free local embedding model — uncomment five lines and the whole notebook runs without one.

### Day 4 — RAG end to end
*Coming soon.*

### Day 5 — Agents & production GenAI
*Coming soon.*

---

## Bonus demo — Kcal Snap

[`Demo_CalorieCounter_AI.ipynb`](notebooks/Demo_CalorieCounter_AI.ipynb) — upload a photo of a meal and get calories plus a macro breakdown, served through a live Gradio link you can open on your phone. It ties together multimodal input, structured output, and a real UI.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `model not found` | Model IDs change often — swap the model string for a current one from the provider's docs. |
| `RateLimitError` / quota | Free tiers are limited. Wait a moment and retry, or switch to the other provider. |
| `AuthenticationError` | The key didn't get set. Re-run the `getpass` cell and paste the key again. |
| Colab disconnected | Re-run from the top: **Runtime → Run all**. Installs and keys don't survive a restart. |
