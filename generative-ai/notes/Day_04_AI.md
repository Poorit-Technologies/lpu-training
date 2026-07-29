# Day 4 · AI — RAG End to End: Grounding, Citations & a Real App

**Date:** ______ · **Block:** Generative AI · **Notebook:** [Day04_AI.ipynb](../notebooks/Day04_AI.ipynb) · **Previous:** [Day 3 · AI](Day_03_AI.md)

> **Trainer context:** Day 3 ended on a five-line RAG teaser **and a deliberate failure** — you asked the search engine about something the documents never mentioned, and it confidently returned three chunks anyway. Today closes that gap. The five lines become a **product**: it answers only from your documents, it **says "I don't know"**, it **cites a page number you can check**, and it ships as a chat app with a link students can open on their phones. Along the way they learn **LangChain** — which is nothing more than standard names for the six pieces they already wrote by hand yesterday.

> ⏱️ **How to use this file:** sections are tagged **`[Core]`** (teach live) or **`[Extended]`** (demo if time, else reading/homework). If you run short, trim Extended first — but **protect §3 (grounding) and §5 (the fix kit)**. §3 is the difference between a demo and something you'd let a student use; §5 is where the real engineering lives.

## 🎯 Objectives
By end of day a student can:
- Name the **six standard components** of a retrieval pipeline and map each to code they wrote yesterday.
- Compose them with **LCEL** (`prompt | llm | parser`) and explain why every component pipes into the next.
- Load a **real PDF**, split it into chunks that carry `source` and `page`, and index them.
- Write the **grounding contract** that makes a model answer only from context — and genuinely refuse otherwise.
- Return **citations from metadata**, and say why a model must never be asked to cite itself.
- Diagnose a bad answer as a **retrieval failure or a generation failure**, and pick the right fix.
- Improve retrieval with **`k`, MMR, query rewriting, hybrid search and reranking**.
- **Measure** retrieval with a golden set and hit-rate@k, and tune a knob using the number rather than a hunch.
- Ship the whole thing as a **Gradio chat app** that handles follow-up questions.

---

## 🔁 Kickoff — recap + hook — 8 min  `[Core]`

**30-second recap of Day 3:** an embedding turns text into a fixed-length list of numbers where *near = similar in meaning* · cosine similarity measures the angle · chunking decides what can ever be found (and bad boundaries destroy facts) · Chroma stores vectors, text and metadata together · `index → embed → store` offline, `query → embed → search → top-k` live.

❓ **Ask the class (one open question):** *"Your RAG bot tells a student the re-evaluation fee is ₹500 and the deadline is 30 days. Both numbers are wrong — the policy says ₹1,000 and 15 days. **Whose fault is it: the search, or the model?**"*

Let them argue. There is no way to answer it from the outside, and that is exactly the point:

| They'll say… | Your reply |
| ----- | ----- |
| *"The model hallucinated"* | "Maybe. But if search handed it page 7 instead of page 3, the model did the best it could." |
| *"The search was wrong"* | "Maybe. But if search found page 3 and the model ignored it, better search won't help." |
| *"We can't tell"* | 🎯 **"Correct. So the first thing we build today is a way to tell."** |

💡 **AHA:** *"'The LLM is hallucinating' is almost never a diagnosis — it's a shrug. Today you learn to print what the model was actually given, and most of the mystery disappears."*

🧑‍🏫 **Trainer note:** write on the board and leave it up all day:

```
RETRIEVAL FAILURE          |   GENERATION FAILURE
the right chunk was        |   the right chunk was there,
never found                |   the answer still went wrong
fix: k · rewrite · hybrid  |   fix: the prompt
     · rerank              |
```

Point at the correct half after every demo. By the end they should be diagnosing before you ask.

---

## 1️⃣ The six pieces you already built — 20 min  `[Core]`

Open with the honest framing: **LangChain is not a new idea. It is standard names for yesterday's code.**

| What they wrote yesterday | Standard name | Today |
| ----- | ----- | ----- |
| reading a file into a string | **Document Loader** | `PdfReader` → page text |
| `naive_chunks()` / the splitter | **Text Splitter** | `RecursiveCharacterTextSplitter` |
| `model.encode(...)` | **Embeddings** | `OpenAIEmbeddings` |
| the Chroma collection | **Vector Store** | `Chroma` |
| `search(query, n_results=3)` | **Retriever** | `vectorstore.as_retriever()` |
| the system prompt + chat call | **Prompt + Chat Model** | `ChatPromptTemplate` + `ChatOpenAI` |
| gluing it together by hand | **LCEL** — the `\|` pipe | `prompt \| llm \| parser` |

### LCEL — why the pipe works

```python
llm    = ChatOpenAI(model="gpt-4o-mini", temperature=0)
prompt = ChatPromptTemplate.from_template("Explain {thing} in one short sentence.")
chain  = prompt | llm | StrOutputParser()

chain.invoke({"thing": "a vector database"})
```

Every component implements the **same two methods** — `.invoke()` and `.stream()`. That shared interface is the entire reason they can be chained. Swap `ChatOpenAI` for Gemini or Claude and the rest of the chain is untouched.

💡 **AHA:** *"The pipe isn't magic syntax. It's the Unix pipe: each box takes the previous box's output. Because they all speak `.invoke()`, any box fits into any slot."*

### ⚠️ The version trap — say this out loud

**LangChain 1.0 broke almost every tutorial on the internet.** If a blog post or a YouTube video uses `RetrievalQA`, `LLMChain` or `create_retrieval_chain`, it is written for the old version. Those now live in a separate **`langchain-classic`** package that is being retired. Students who copy them will get deprecation warnings today and broken code later.

**The current way is LCEL** — what we use all day.

| If you see this in a tutorial | It means | Use instead |
| ----- | ----- | ----- |
| `RetrievalQA.from_chain_type(...)` | pre-1.0 | an LCEL chain (§3) |
| `LLMChain(llm=..., prompt=...)` | pre-1.0 | `prompt \| llm` |
| `create_retrieval_chain(...)` | pre-1.0 (`langchain-classic`) | an LCEL chain |
| `from langchain.retrievers import ...` | pre-1.0 | build it yourself (§5) or `langchain-classic` |

🧑‍🏫 **Trainer note:** this table is worth more to them than any single technique today. Frameworks in this space move fast; the durable skill is *recognising which era a code sample is from*. Also flag that **`langchain-community` was archived in June 2026** — a package that thousands of tutorials still import.

### When to reach for what

| Tool | It is… | Use it when |
| ----- | ----- | ----- |
| **Plain Python** | no dependency, full control | small pipelines, learning, when you need to know exactly what happens ✅ *(Day 3)* |
| **LangChain** | components + LCEL + a large integration set | you want standard pieces and swappable providers ✅ *(today)* |
| **LlamaIndex** | the same idea, built data-first | document-heavy apps, complex indexes |
| **LangGraph** | graphs with state, loops and branching | agents that decide and retry *(Day 5)* |

❓ **Ask:** *"If every component speaks `.invoke()`, what does that let you change without touching the rest of the chain?"* → *the model, the provider, the vector store, the embedding model — anything. That is the whole point of an interface.*

---

## 2️⃣ Real documents — load, split, carry metadata — 25 min  `[Core]`

Yesterday's corpus was a Python string. Real documents are PDFs, and they bring one thing a string never had: **structure you can cite**.

The notebook writes an **8-page LPU Examination & Attendance Policy** PDF, then reads it back — so everyone in the room works from an identical document, offline, with no download.

```python
reader = PdfReader("lpu_exam_policy.pdf")
page_texts = [page.extract_text() for page in reader.pages]
```

That is the whole of "document loading": a PDF in, a list of page strings out.

### Metadata is the point

```python
chunks = splitter.create_documents(
    page_texts,
    metadatas=[{"source": "lpu_exam_policy.pdf", "page": i + 1} for i in range(len(page_texts))],
)
```

A LangChain **`Document`** is exactly two things: `page_content` and `metadata`. Nothing more.

💡 **AHA:** *"That page number is going to travel all the way from the PDF, through the splitter, through the vector database, and land at the bottom of the answer as a citation. Attach it now or lose it forever."*

🧑‍🏫 **Trainer note — attach metadata at split time.** Once chunks are embedded and stored, working out which page a chunk came from means redoing the work. This is a genuine "wish I'd known" moment in real projects.

🧑‍🏫 **Trainer note — real PDFs are worse than this one.** Scanned pages have **no text layer at all** (you need OCR — `pypdf` returns empty strings and students assume the code is broken). Two-column layouts extract in the wrong reading order. Tables become word soup. Always print the extracted text before trusting it. Say plainly: *"half of real RAG work is getting clean text out of ugly files."*

❓ **Ask:** *"We split by character count. What would you split a 300-page policy by, if you could?"* → *by heading/section — a meaning boundary. Page breaks are a printing accident (Day 3's point, now with a real PDF in front of them).*

---

## 3️⃣ Grounding — making it say "I don't know" — 28 min  `[Core]`  ← protect this

### First, watch it lie

Before building the good version, run the model with **no context and no rules**:

```python
llm.invoke("What is the re-evaluation fee at LPU, and how many days do I have to apply?")
```

It produces a fluent, specific, confidently-formatted, **entirely invented** policy. Read it aloud. Let the room sit with it.

💡 **AHA:** *"Notice it didn't hedge. It didn't say 'I'm not sure'. Fluency is not knowledge — and the model has no way to tell you which of its answers are memories and which are guesses."*

### The contract

Two rules do almost all of the work:

```python
RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You answer questions about the LPU examination policy.\n"
     "Use ONLY the context below. Do not use any other knowledge.\n"
     "If the context does not contain the answer, reply exactly: "
     "I don't know based on the policy document.\n\n"
     "Context:\n{context}"),
    ("human", "{question}"),
])
```

### The chain

```python
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | RAG_PROMPT
    | llm
    | StrOutputParser()
)
```

Walk it on the board, slowly — this is the densest four lines of the day:

```
              "What is the re-evaluation fee?"
                             |
      +----------------------+----------------------+
      |                                             |
  retriever                                RunnablePassthrough
  (find 3 chunks)                          (keep the question as-is)
      |                                             |
  format_docs                                       |
      |                                             |
      +-----------------> RAG_PROMPT <--------------+
                              |
                             llm          temperature=0
                              |
                       StrOutputParser
                              |
                           answer
```

**The dict at the front is the bit that confuses everyone.** Each key is computed **in parallel**, and the resulting dictionary is exactly the `{context}` and `{question}` the prompt asked for. `RunnablePassthrough()` means "this key is just the input, unchanged".

### The payoff

```python
rag_chain.invoke("What is the hostel fee at LPU?")
# -> I don't know based on the policy document.
```

**This is the Day 3 failure, fixed.** Yesterday the identical question returned three confident chunks.

💡 **AHA:** *"Retrieval has no concept of 'nothing here is relevant' — it always returns its top-k. The **prompt** is what turns 'here are the 3 closest chunks' into 'this document doesn't answer your question.'"*

💡 **AHA — the business case:** *"A system that says 'I don't know' 5% of the time is worth far more than one that is confidently wrong 5% of the time — because nobody can tell which 5% they're reading."*

🧑‍🏫 **Trainer note — `temperature=0`.** For RAG you want the model **reading**, not writing. Turn it up to 1 live and re-run the same question a few times; watch the answer drift while the source text sits unchanged.

🧑‍🏫 **Trainer note — grounding is not a guarantee.** A determined model can still blend its training knowledge in, especially on famous topics. The prompt makes it *much* rarer, not impossible. That honesty matters: they will meet this in production, and Day 5's evaluation is how you catch it.

❓ **Ask:** *"We told it to say exactly 'I don't know based on the policy document'. Why specify the exact words instead of just 'say you don't know'?"* → *because your code downstream can detect it — log it, show a "contact the office" button, route to a human. A refusal you can pattern-match is a feature; a differently-worded apology every time is not.*

---

## 4️⃣ Citations — trust comes from metadata — 20 min  `[Core]`

An answer a student cannot verify is an answer they have to take on faith.

```python
rag_with_sources = RunnableParallel(
    context=retriever,
    question=RunnablePassthrough(),
).assign(
    answer=(lambda x: {"context": format_docs(x["context"]), "question": x["question"]})
           | RAG_PROMPT | llm | StrOutputParser()
)
```

`.assign()` runs the answer chain but **keeps the retrieved Documents alongside it** — `rag_chain` threw them away. The result is a dict: `question`, `context` (the Documents), `answer`.

```python
for doc in result["context"]:
    print(f"  - {doc.metadata['source']}, page {doc.metadata['page']}")
```

⚠️ **The rule to hammer:** **never ask the model to produce the citation.** A model told to "cite your source" will cheerfully invent a plausible page number — which is precisely the behaviour you are trying to eliminate. The page number here was carried from the PDF, through the splitter, through the vector store, and printed by **your** code. The model never touched it.

💡 **AHA:** *"The answer is generated. The citation is **retrieved**. Those are two completely different trust levels, and mixing them up is how you ship a bot that invents case law."*

🧑‍🏫 **Trainer note:** this is also the debugging view. If an answer looks wrong, print `result["context"]` — you will see instantly whether retrieval or generation is at fault. Tie it back to the board.

❓ **Ask:** *"A legal-research product cited three cases that don't exist. Where in this pipeline did that team go wrong?"* → *they let the model write the citations instead of carrying them through as metadata. (This has happened, more than once, with real consequences.)*

---

## 5️⃣ When retrieval fails — the fix kit — 35 min  `[Core]`  ← protect this

Grounding stops the model inventing. It does **not** help when the right chunk was never retrieved — then a well-behaved system politely says "I don't know" about something printed on page 3. That is now your most common bug.

**Always start the same way: look at what was retrieved.**

```python
docs = retriever.invoke(question)
for i, doc in enumerate(docs, 1):
    print(f"[{i}] page {doc.metadata['page']}: {doc.page_content[:110]}...")
```

### 5.1 `k` and MMR  `[Core]`

**`k`** — the cheapest fix: retrieve more.

```python
wide_retriever = vectorstore.as_retriever(search_kwargs={"k": 6})
```

More chunks = better odds, *and* a longer, costlier, noisier prompt. Cite ["Lost in the Middle"](https://arxiv.org/abs/2307.03172): models attend best to the **start and end** of their context, so burying the good chunk among ten others can make things **worse**. The answer is *retrieve broad, then narrow* — which is reranking.

**MMR** — Maximal Marginal Relevance picks chunks that are relevant **and different from each other**:

```python
vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 3, "fetch_k": 10})
```

💡 **AHA:** *"Plain top-3 on a policy document often returns the same paragraph three times in slightly different chunks. You paid for three slots and learned one thing. MMR spends them on three different things."*

### 5.2 Query rewriting  `[Core]`

**Users don't write search queries. They write questions** — vague, conversational, full of pronouns.

| A student types | What would actually retrieve well |
| ----- | ----- |
| "i missed loads of classes, am i in trouble?" | "attendance requirement debarment percentage" |
| "how do I complain about my marks?" | "re-evaluation application fee deadline" |
| "and what if I was ill?" *(a follow-up)* | "medical grounds attendance relaxation certificate" |

```python
rewriter = REWRITE_PROMPT | llm | StrOutputParser()
```

Then compare which pages each version finds. Costs one extra LLM call; often the single biggest quality win in a chat product.

🧑‍🏫 **Trainer note:** the third row is the one that matters for §6. A bare follow-up like *"and what if I was ill?"* embeds to almost nothing useful. Rewriting **with the conversation history** is what makes multi-turn RAG work at all.

### 5.3 Hybrid search  `[Extended]`

Vector search is strong on meaning, weak on **exact strings** — ask for "UMC" and you may get paragraphs *about* misconduct that never contain the term. Keyword search (BM25) is the mirror image. Production runs both and merges.

**Reciprocal Rank Fusion** — merge by position, not by score:

```
score(chunk) = sum over both lists of  1 / (60 + rank)
```

💡 **AHA:** *"RRF needs no tuning and no score normalisation — the two systems' scores aren't even in the same units. It only asks 'what position did each list put this in?' A chunk both methods like wins; a chunk only one method loves still gets a chance."*

### 5.4 Reranking  `[Extended]`

The embedding model encoded every chunk **before it ever saw your question**. That is what makes search fast — and approximate. A **reranker** looks at the question and one chunk **together** and scores that pair properly.

```
retrieve 6 (fast, approximate) → rerank (slow, accurate) → keep top 3 → LLM
```

| | Bi-encoder (retrieval) | Cross-encoder (reranking) |
| ----- | ----- | ----- |
| Sees | query and doc **separately** | query and doc **together** |
| Speed | millions of docs, milliseconds | one pair at a time |
| Use for | narrowing to ~20 candidates | ordering those 20 properly |

🧑‍🏫 **Trainer note:** the notebook reranks with `gpt-4o-mini` because students already have that key. **In production you would not.** A dedicated cross-encoder — free and local `cross-encoder/ms-marco-MiniLM-L-6-v2`, or hosted [Cohere Rerank](https://docs.cohere.com/docs/rerank) at roughly $0.0025 per search of up to 100 documents — is 10–100× faster and cheaper for the same job. *(Latest 2026 pricing — re-check on the day.)*

### The fix kit — one table to remember

| Symptom | Reach for | Cost |
| ----- | ----- | ----- |
| right chunk just missed the cut | bigger `k` | longer prompt |
| three chunks all say the same thing | **MMR** | none |
| question is vague or conversational | **query rewriting** | +1 LLM call |
| exact terms, codes, names missed | **hybrid search** | none |
| right chunk retrieved but ranked 5th | **reranking** | +1 call / latency |
| nothing relevant exists in the corpus | the grounding prompt (§3) | none |

❓ **Ask:** *"Your bot can't find anything when users ask about 'UMC'. Which tool, and why?"* → *hybrid search. It's an exact token; vectors are bad at those and BM25 is excellent at them.*

---

## 6️⃣ Measure it, then ship it — 35 min  `[Core]`

### Every knob in §5 is a guess until you measure it

The cheapest useful measurement in RAG: take a handful of real questions, write down a fact that **must** appear in the retrieved chunks, count how often it does.

```python
GOLDEN = [
    ("How much attendance do I need?",                     "75 percent"),
    ("What is the passing mark in a course?",              "40 percent"),
    ("How long do I have to apply for re-evaluation?",     "15 days"),
    ("What is the re-evaluation fee?",                     "1,000"),
    ("What if I am caught with a phone in the exam hall?", "mobile phone"),
    ("When are backlog exams held?",                       "summer"),
]
```

One number — **hit rate @k** — and suddenly these stop being opinions:

- Does `k=1` still work?
- Is hybrid search better *on this corpus*?
- Was `chunk_size=400` a good choice?

💡 **AHA:** *"This is the honest answer to 'what chunk size should I use?' — you **measure** it. Not vibes, not a blog post. Six questions written in ten minutes beats an afternoon of staring at code."*

⚠️ Two honest caveats: a golden set of 6 is a **teaching** size (aim for 30–100 real user questions), and this measures **retrieval only** — it says nothing about whether the final answer was good. Judging answers (LLM-as-judge, faithfulness, RAGAS) is **Day 5**.

### Ship it

A notebook cell is not a product. The chat interface introduces one genuinely new problem:

> "How much attendance do I need?" → *75 percent*
> "**And what if I was ill?**" ← embed *that* on its own and you retrieve nothing useful.

The fix is §5.2's rewriter, now given the conversation:

```python
def rag_answer(message, history):
    if history:
        recent = "\n".join(f"{m['role']}: {m['content']}" for m in history[-4:])
        search_query = rewriter.invoke({"question": f"{recent}\nFollow-up: {message}"})
    else:
        search_query = message

    docs = retriever.invoke(search_query)                 # retrieve on the rewritten query
    answer = (RAG_PROMPT | llm | StrOutputParser()).invoke(
        {"context": format_docs(docs), "question": message}   # answer the real question
    )
    pages = sorted({d.metadata["page"] for d in docs})
    return f"{answer}\n\n*Source: lpu_exam_policy.pdf - page {', '.join(str(p) for p in pages)}*"
```

💡 **AHA — the split that matters:** *"Retrieve on the rewritten query. Answer the question the user actually asked. Mix those two up and your bot starts answering questions nobody asked."*

Then `gr.ChatInterface(..., type="messages").launch(share=True)` and the room opens it on their phones.

🧑‍🏫 **Trainer note:** the examples list deliberately includes **"What is the hostel fee?"** Let a student tap it in front of everyone and watch the refusal land. That is the whole day in one screenshot.

### What production adds (name it, don't build it)

| Concern | The reality |
| ----- | ----- |
| **Cost** | one question ≈ 1 embedding call + 1–3 chat calls. Rewriting and reranking each add a call. |
| **Latency** | rewriting +100–300 ms, reranking +100–500 ms. Budget them; don't add both by reflex. |
| **Freshness** | the policy changed — re-index. Indexing is offline, so this is a job, not a request. |
| **Access control** | filter by metadata *before* searching, so a user can never retrieve a document they can't read. |
| **Observability** | log the query, the rewritten query, the retrieved chunk ids and the answer. Without this you cannot debug a complaint. ([LangSmith](https://smith.langchain.com/) does this for LangChain apps.) |

❓ **Ask:** *"You add query rewriting AND reranking to every request. What did you just spend?"* → *two extra LLM calls and up to ~800 ms on every single question — including the easy ones. Apply them where they pay; measure first.*

---

## 🧪 In-class exercises  `[Core]`
Fill-in-the-blank versions are in the notebook (§12) — these are the same tasks in prose.

1. **Your first chain** — build `prompt | llm | StrOutputParser()` and invoke it. Then break it on purpose: remove the parser and look at what comes back instead.
2. **Read the metadata** — retrieve for a question of your own and print the page of every chunk. Confirm by opening the PDF.
3. **Make it refuse** — write your own grounded prompt, ask something answerable, then something the policy never mentions.
4. **Measure a change** — add a question to the golden set, then compare hit rate at `k=1` and `k=5`.
5. **Cite your sources** — return an answer together with the pages it came from.

---

## 📝 Revision & Quiz — 8 min  `[Core]`
*(answers in italics — trainer copy)*

1. What are the two things inside a LangChain `Document`? — *`page_content` and `metadata`.*
2. Why can components be joined with `|`? — *they all implement the same interface (`.invoke()`/`.stream()`), so any one fits where another was.*
3. What does `RunnablePassthrough()` do in the RAG chain? — *passes the input through unchanged, so the question reaches the prompt as-is while the retriever works on it in parallel.*
4. Name the two rules of the grounding prompt. — *use ONLY the provided context; say "I don't know" if the answer isn't there.*
5. Why `temperature=0` for RAG? — *you want the model reading and reporting, not inventing.*
6. Where do citations come from? — *the chunk metadata, carried through from the loader — never from the model.*
7. An answer is wrong. What is the very first thing you print? — *the retrieved chunks — to tell a retrieval failure from a generation failure.*
8. What does MMR fix that a bigger `k` doesn't? — *redundancy — it picks chunks that are relevant and different, instead of three copies of the same paragraph.*
9. Why does hybrid search exist? — *vector search is weak on exact strings (codes, IDs, acronyms) and keyword search is weak on meaning; they fail in opposite directions.*
10. What is a golden set, and what does hit-rate@k tell you? — *a small set of real questions plus a fact that must be retrieved; the fraction of questions whose fact appears in the top-k — a retrieval-only score.*
11. Why rewrite a follow-up question before retrieving? — *"and what if I was ill?" has no searchable content on its own; the rewriter uses the history to make it standalone.*
12. If a tutorial uses `RetrievalQA`, what does that tell you? — *it's written for pre-1.0 LangChain; that class now lives in the retiring `langchain-classic` package. Use an LCEL chain.*

---

## 🏠 Homework
1. **Swap the document** — replace `lpu_exam_policy.pdf` with a PDF you actually care about (a syllabus, a manual, a paper). Everything below §3 should work unchanged.
2. **Write a golden set of 10** questions for *your* document, and record hit rate at `k=1`, `3` and `5`. Bring the three numbers.
3. **Break it on purpose** — find one question where retrieval fails, fix it with exactly **one** technique from §5, and write down which one and why it was the right choice.
4. `[Extended]` **Cost it** — count the API calls one chat turn makes with rewriting and reranking on, then off. Estimate the cost of 1,000 student questions a day.

---

## 🔗 Resources (verify on teaching day)
- **LangChain — LCEL & Runnables:** https://python.langchain.com/docs/concepts/lcel/
- **LangChain — retrievers:** https://python.langchain.com/docs/concepts/retrievers/
- **Lost in the Middle (Liu et al., 2023):** https://arxiv.org/abs/2307.03172
- **Query Rewriting for RAG (Ma et al., 2023):** https://arxiv.org/abs/2305.14283
- **Cohere Rerank:** https://docs.cohere.com/docs/rerank · **free local cross-encoder:** https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- **RAGAS (evaluation at scale):** https://docs.ragas.io/ *(Day 5)*
- **pypdf:** https://pypdf.readthedocs.io/

> **Next — Day 5:** AI agents — models that decide *which* tool to use and when, with memory and planning — plus production GenAI: cost, evaluation and responsible AI.
