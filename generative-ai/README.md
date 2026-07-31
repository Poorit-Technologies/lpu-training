# Generative AI — Week 1 (Days 1–5)

Everything for the GenAI half of the course. **Runs in Google Colab — nothing to install.**

## Folders

| Folder | What's in it |
| --- | --- |
| [`notebooks/`](notebooks/) | The main class notebooks. This is what we run together in class. |
| [`exercises/`](exercises/) | Practice notebooks — fill in the `___` blanks, or build one from scratch. |
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
- Exercises: [`Day02_Exercises.ipynb`](exercises/Day02_Exercises.ipynb) — Pydantic validation + Gradio UIs, five short tasks and a mini-project
- Slides: [`Day02_GenAI.pptx`](slides/Day02_GenAI.pptx)
- Notes: [`Day_02_AI.md`](notes/Day_02_AI.md)

> Q1–Q4 of the exercises need **no API key** — only Q5 and the mini-project do.

**Build it yourself.** Three standalone notebooks — no starter code, no blanks to fill. Each
one gives you the setup and the boring parts, then hands you the build:

| Notebook | What you build | Key needed |
| --- | --- | --- |
| [`Day02a_WordCounter.ipynb`](exercises/Day02a_WordCounter.ipynb) | a plain Python function turned into a web app with `gr.Interface` | no |
| [`Day02b_PamphletGenerator.ipynb`](exercises/Day02b_PamphletGenerator.ipynb) | scrape a company's landing page, stream an AI-written pamphlet into a UI (the scraper is given) | yes |
| [`Day02c_ChatInterface.ipynb`](exercises/Day02c_ChatInterface.ipynb) | a chatbot with a personality, memory included, via `gr.ChatInterface` | yes |

### Day 3 — Embeddings & vector search
Why keyword search fails on meaning, turning text into embeddings, measuring closeness with cosine similarity, chunking documents (and what bad boundaries destroy), storing and filtering vectors in Chroma, then assembling the full index → embed → store → search pipeline and finishing with RAG in five lines.

- Notebook: [`Day03_AI.ipynb`](notebooks/Day03_AI.ipynb)
- Exercise: [`Day03_Exercises.ipynb`](exercises/Day03_Exercises.ipynb) — one exercise in five steps: chunk a document, then embed the same chunks twice (HuggingFace `sentence-transformers` and LiteLLM) and compare
- Slides: [`Day03_GenAI.pptx`](slides/Day03_GenAI.pptx)
- Notes: [`Day_03_AI.md`](notes/Day_03_AI.md)

**Build it yourself.** Two standalone notebooks — no starter code, no blanks:

| Notebook | What you build | Key needed |
| --- | --- | --- |
| [`Day03a_EmbeddingExplorer.ipynb`](exercises/Day03a_EmbeddingExplorer.ipynb) | plot your own sentences as a map of meaning, then find nearest neighbours | no |
| [`Day03b_DocumentQA.ipynb`](exercises/Day03b_DocumentQA.ipynb) | chunk + index a document of your choice and ask it questions, with a Gradio chat | yes |

> **No OpenAI key? Most of it still runs.** The notebook builds on the free local `all-MiniLM-L6-v2` model, so sections 2–5 and 7–9 need no key at all. Only the OpenAI embeddings section (§6) and the RAG teaser (§10) do.

### Day 4 — RAG end to end
Meeting **LangChain** and finding the standard name for every piece you wrote by hand on Day 3, chat models and message types, reusable **prompt templates**, chaining with **LCEL** (the `|` pipe), turning your own `retrieve()` function into a LangChain component with **`RunnableLambda`**, watching an ungrounded model invent a fact and then stopping it, making the chain genuinely say **"I don't know"**, returning **citations** taken from chunk metadata, fixing retrieval when it fails (`n_results`, a distance cut-off, query rewriting, hybrid search, reranking), **measuring** it with a golden set and hit-rate@k, and shipping the whole thing as a **Gradio chat app** with a link you can open on your phone.

- Notebook: [`Day04_AI.ipynb`](notebooks/Day04_AI.ipynb)
- Slides: [`Day04_GenAI.pptx`](slides/Day04_GenAI.pptx)
- Notes: [`Day_04_AI.md`](notes/Day_04_AI.md)

> **Sections 1–7 need no API key.** It's the same document, the same local `all-MiniLM-L6-v2` embedder and the same Chroma collection as Day 3 — only the answer-generating half (§8 onwards) calls a paid model.

**Build it yourself.** One standalone notebook — no starter code, no blanks:

| Notebook | What you build | Key needed |
| --- | --- | --- |
| [`Day04a_PDFChatbot.ipynb`](exercises/Day04a_PDFChatbot.ipynb) | upload **your own PDF**, index it so every chunk remembers its page, and chat with it through `gr.ChatInterface` — grounded, cited by page number, and honest enough to say "I don't know" | yes, from step 4 |

> No PDF handy? The notebook has a one-cell fallback that downloads the paper which introduced RAG — so you can build a RAG bot that answers questions about RAG.

### Day 5 — Agents & production GenAI
Finding the wall Day 4's bot hits — where retrieval is **perfect** and the answer is still wrong, because the model needed to *do* something. Building the **agent loop** by hand (LLM + tools + loop, driven by `finish_reason`), turning **yesterday's whole RAG app into one tool** the model can choose to call, watching it **plan** across three tools, giving it **memory** (a list, then a `thread_id`), rebuilding the same agent in one line with **`create_agent`** and seeing the LangGraph cycle underneath, telling a **workflow** from an **agent** and building a router, scoring answers with an **LLM-as-judge** on groundedness (and learning how judges lie), doing the **cost arithmetic of a loop**, and finishing with **prompt injection** arriving through a retrieved document and a **human-in-the-loop** gate that stops it.

- Notebook: [`Day05_AI.ipynb`](notebooks/Day05_AI.ipynb)
- Slides: [`Day05_GenAI.pptx`](slides/Day05_GenAI.pptx)
- Notes: [`Day_05_AI.md`](notes/Day_05_AI.md)

**Build it yourself.** One standalone notebook — no starter code, no blanks:

| Notebook | What you build | Key needed |
| --- | --- | --- |
| [`Day05a_ResearchAgent.ipynb`](exercises/Day05a_ResearchAgent.ipynb) | a multi-tool agent over a topic you choose: three tools you write, the loop, memory, a Gradio chat, and an approval gate | yes |

> **You need a key from §2 onwards** — the agent loop is API calls all the way down. The embedding model is still the free local `all-MiniLM-L6-v2`, and it's the same document and Chroma collection as Days 3 and 4.

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
