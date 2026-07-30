# Day 4 · AI — RAG End to End: Grounding, Citations & a Real App

**Date:** ______ · **Block:** Generative AI · **Notebook:** [Day04_AI.ipynb](../notebooks/Day04_AI.ipynb) · **Previous:** [Day 3 · AI](Day_03_AI.md)

> **Trainer context:** Day 3 ended on a five-line RAG teaser **and a deliberate failure** — you asked the search engine about something the documents never mentioned, and it confidently returned three chunks anyway. Today closes that gap. The five lines become a **product**: it answers only from your documents, it **says "I don't know"**, it **cites the section it read**, and it ships as a chat app with a link students open on their phones. Along the way they meet **LangChain** — which is nothing more than standard names for the pieces they already wrote by hand yesterday. **Same document, same `retrieve()` function, same Chroma collection.** Today we make it trustworthy.

> ⏱️ **How to use this file:** sections are tagged **`[Core]`** (teach live) or **`[Extended]`** (demo if time, else reading/homework). If you run short, trim Extended first — but **protect §3 (grounding) and §5 (the fix kit)**. §3 is the difference between a demo and something you'd let a colleague use; §5 is where the real engineering lives.

## 🎯 Objectives
By end of day a student can:
- Name the standard **components** of a retrieval pipeline and map each to code they wrote yesterday.
- Use `ChatOpenAI` with **message types**, and build reusable prompts with `ChatPromptTemplate`.
- Compose components with **LCEL** (`prompt | llm | parser`) and explain why the pipe works at all.
- Turn **their own `retrieve()` function** into a chain component with `RunnableLambda`.
- Write the **grounding contract** that makes a model answer only from context — and genuinely refuse otherwise.
- Return **citations from chunk metadata**, and say why a model must never be asked to cite itself.
- Diagnose a bad answer as a **retrieval failure or a generation failure**, and pick the right fix.
- Improve retrieval with **`n_results`, a distance cut-off, query rewriting, hybrid search and reranking**.
- **Measure** retrieval with a golden set and hit-rate@k, and tune a knob using the number rather than a hunch.
- Ship the whole thing as a **Gradio chat app** that handles follow-up questions.

---

## 🔁 Kickoff — recap + hook — 8 min  `[Core]`

**30-second recap of Day 3:** an embedding turns text into a fixed-length list of numbers where *near = similar in meaning* · cosine similarity measures the angle · chunking decides what can ever be found (and bad boundaries destroy facts) · Chroma stores vectors, text and metadata together · `chunk → embed → store` offline, `query → embed → search → top-k` live.

❓ **Ask the class (one open question):** *"Your HR bot tells a new joiner the learning budget is **25,000 a year**. It's actually **50,000**. And here's the twist — **25,000 does appear in the document**: it's SmartHR's monthly price. **Whose fault is it: the search, or the model?**"*

Let them argue. There is no way to answer it from the outside, and that is exactly the point:

| They'll say… | Your reply |
| ----- | ----- |
| *"The model hallucinated"* | "Maybe. But 25,000 is genuinely in the document — if search handed it the Products chunk instead of the Benefits chunk, the model reported what it was given." |
| *"The search pulled the wrong chunk"* | "Maybe. But if search found the Benefits paragraph and the model still said 25,000, better search won't help." |
| *"We can't tell"* | 🎯 **"Correct. So the first thing we build today is a way to tell."** |

💡 **AHA:** *"'The LLM is hallucinating' is almost never a diagnosis — it's a shrug. Today you learn to print what the model was actually given, and most of the mystery disappears."*

🧑‍🏫 **Trainer note:** this hook is stronger than a generic hallucination because **the wrong number is real**. It is in the corpus, one paragraph away. That makes "retrieval pulled the wrong neighbour" concrete instead of theoretical. Write on the board and leave it up all day:

```
RETRIEVAL FAILURE          |   GENERATION FAILURE
the right chunk was        |   the right chunk was there,
never found                |   the answer still went wrong
fix: n_results · rewrite   |   fix: the prompt
     · hybrid · rerank     |
```

Point at the correct half after every demo. By the end they should be diagnosing before you ask.

---

## 1️⃣ The pieces you already built — 25 min  `[Core]`

Open with the honest framing: **LangChain is not a new idea. It is standard names for yesterday's code.**

| What they wrote yesterday | Standard name | Today |
| ----- | ----- | ----- |
| the knowledge-base string | **Document** | text + metadata |
| `RecursiveCharacterTextSplitter` | **Text Splitter** | the same class |
| `embedder.encode(...)` | **Embeddings** | the same model (`all-MiniLM-L6-v2`) |
| the Chroma collection | **Vector Store** | the same collection |
| `search(query, n_results=3)` | **Retriever** | `retrieve()`, wrapped in `RunnableLambda` |
| the system prompt + chat call | **Prompt + Chat Model** | `ChatPromptTemplate` + `ChatOpenAI` |
| gluing them together by hand | **LCEL** — the `\|` pipe | `prompt \| llm \| parser` |

💡 **AHA:** *"You are not starting over. You are labelling what you already own."*

### Chat models and messages (notebook §3)

```python
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

messages = [
    SystemMessage(content="You are a helpful engineering tutor. Keep answers to one sentence."),
    HumanMessage(content="What is retrieval augmented generation?"),
]
response = llm.invoke(messages)      # -> an AIMessage
```

Then the beat that pays off in §6: **append the `AIMessage` and a new `HumanMessage` and you have a conversation.**

💡 **AHA:** *"'Conversation memory' is not a feature you switch on. It is a Python list you keep appending to."*

### Prompt templates (notebook §4)

```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that explains {topic} concepts simply."),
    ("human", "{question}"),
])
prompt.invoke({"topic": "search", "question": "What is an embedding?"})   # no model call yet
```

Templates separate **prompt logic** from **prompt data** — which is exactly what you need when `{context}` changes on every single request.

### LCEL — why the pipe works (notebook §5)

```python
chain = prompt | llm | StrOutputParser()
chain.invoke({"topic": "search", "question": "What is cosine similarity?"})
```

Every component implements the **same interface** — `.invoke()` and `.stream()`. That shared contract is the entire reason they chain. `a | b` means *"call `a.invoke()`, pass the result to `b.invoke()`"*.

💡 **AHA:** *"The pipe isn't magic syntax. It's the Unix pipe. Because every box speaks `.invoke()`, any box fits into any slot."*

Then `RunnableLambda`, which is the hinge of the whole day:

```python
def add_word_count(text):
    return f"{text}  (words: {len(text.split())})"

chain = prompt | llm | StrOutputParser() | RunnableLambda(add_word_count)
```

🧑‍🏫 **Trainer note — flag this hard.** `RunnableLambda` wraps *any* Python function as a chain component. In §3 it is what lets **their own `retrieve()`** — the function they wrote yesterday — become a LangChain component. Say it now so the payoff lands later.

### ⚠️ The version trap — say this out loud

**LangChain 1.0 broke almost every tutorial on the internet.** If a blog post or video uses `RetrievalQA`, `LLMChain` or `create_retrieval_chain`, it is written for the old version. Those now live in a separate **`langchain-classic`** package that is being retired.

| If you see this in a tutorial | It means | Use instead |
| ----- | ----- | ----- |
| `RetrievalQA.from_chain_type(...)` | pre-1.0 | an LCEL chain (§3) |
| `LLMChain(llm=..., prompt=...)` | pre-1.0 | `prompt \| llm` |
| `create_retrieval_chain(...)` | pre-1.0 (`langchain-classic`) | an LCEL chain |
| `from langchain.retrievers import ...` | moved out of `langchain` | write it yourself (§5) |
| `from langchain_community import ...` | **archived June 2026** | a standalone package |

🧑‍🏫 **Trainer note:** this table is worth more to them than any single technique today. Frameworks in this space move fast; the durable skill is *recognising which era a code sample is from*.

### When to reach for what

| Tool | It is… | Use it when |
| ----- | ----- | ----- |
| **Plain Python** | no dependency, full control | learning, small pipelines ✅ *(Day 3)* |
| **LangChain** | components + LCEL + a large integration set | standard pieces, swappable providers ✅ *(today)* |
| **LlamaIndex** | the same idea, built data-first | document-heavy apps, complex indexes |
| **LangGraph** | graphs with state, loops and branching | agents that decide and retry *(Day 5)* |

❓ **Ask:** *"If every component speaks `.invoke()`, what can you swap without touching the rest of the chain?"* → *the model, the provider, the vector store, the embedding model — anything. That is what an interface buys you.*

---

## 2️⃣ The knowledge base — metadata is the point — 22 min  `[Core]`

**Same document as yesterday.** Same splitter, same embedder, same collection. Exactly **one** thing is new.

Yesterday they stored `ids`, `embeddings` and `documents`. Yesterday's notebook even said *"you can also attach `metadatas` — `source`, `page`, `date` — which lets you filter before searching and cite the real source afterwards."* Today they collect on that promise.

```python
docs = splitter.create_documents(
    [t.strip() for t in SECTIONS.values()],
    metadatas=[{"section": name} for name in SECTIONS],
)
```

The TechSolutions document is split into its five natural sections — **Company Overview · Leadership · Products · Work Policy · Benefits and Clients** — so every chunk remembers where it came from.

A LangChain **`Document`** is exactly two things: `page_content` and `metadata`. Nothing more.

```python
collection.add(
    ids=[f"chunk_{i}" for i in range(len(chunks))],
    embeddings=embeddings.tolist(),
    documents=chunks,
    metadatas=[d.metadata for d in docs],     # <- the only new argument
)
```

💡 **AHA:** *"That section name is going to travel through the splitter, through the vector database, and land at the bottom of the answer as a citation. Attach it now or lose it forever."*

🧑‍🏫 **Trainer note — attach metadata at split time.** Once chunks are embedded and stored, working out which section a chunk came from means redoing the work. This is a genuine "wish I'd known" moment in real projects: teams index a corpus, discover they can't cite anything, and re-index from scratch.

🧑‍🏫 **Trainer note — two live gotchas.** Collection names are validated (3–512 chars, `a-z A-Z 0-9 . _ -`, alphanumeric at both ends) so `"kb"` raises. And we use `get_or_create_collection`, not `create_collection`, because students re-run cells constantly and `create_collection` raises on the second run.

❓ **Ask:** *"What else would you attach at split time, for a real company document?"* → *`source` file, `page`, `date`, `author`, and — the one nobody guesses — an **access level**, so a user can't retrieve a document they're not allowed to read.*

---

## 3️⃣ Grounding — making it say "I don't know" — 30 min  `[Core]`  ← protect this

### First, watch it lie

Before building the good version, run the model with **no context and no rules**:

```python
llm.invoke("What is the learning budget per employee at TechSolutions India?")
```

**TechSolutions India is a made-up company.** The model has never seen this document and cannot have. Whatever number it produces, it produced from nothing — fluently, specifically, without a hint of hedging.

💡 **AHA:** *"Notice it didn't say 'I'm not sure'. Fluency is not knowledge — and the model has no way to tell you which of its answers are memories and which are guesses."*

### The bridge — your function becomes a component

This is the moment of the day. `RunnableLambda` turns yesterday's nine-line function into a LangChain component:

```python
retriever = RunnableLambda(retrieve)        # YOUR retrieve(), unchanged
```

💡 **AHA:** *"You didn't need LangChain to write a retriever. You wrote one yesterday. All the framework did was give it a name and a socket to plug into."*

### The contract

```python
RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are a helpful assistant for TechSolutions India.\n"
     "Answer using ONLY the context below. Do not use any other knowledge.\n"
     "If the context does not contain the answer, reply exactly: "
     "I don't know based on the company documents.\n\n"
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
              "What is the learning budget per employee?"
                             |
      +----------------------+----------------------+
      |                                             |
  retriever                                RunnablePassthrough
  (your retrieve fn)                       (keep the question as-is)
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

🧑‍🏫 **Trainer note — a detail worth 20 seconds:** `format_docs` is a plain function, *not* wrapped in `RunnableLambda`. Inside a pipe LangChain coerces functions automatically. `RunnableLambda` is only needed when you want the Runnable object itself (as we did for `retriever`).

### The payoff

```python
rag_chain.invoke("Who is the CFO of TechSolutions?")
# -> I don't know based on the company documents.
```

The document names a **CEO**, a **CTO** and a **VP of Engineering**. There is no CFO in it — and yesterday, the identical question still returned three confident chunks.

💡 **AHA:** *"Retrieval has no concept of 'nothing here is relevant' — it always returns its top-k. The **prompt** is what turns 'here are the 3 closest chunks' into 'this document doesn't answer your question.'"*

💡 **AHA — the business case:** *"A system that says 'I don't know' 5% of the time is worth far more than one that is confidently wrong 5% of the time — because nobody can tell which 5% they're reading."*

🧑‍🏫 **Trainer note — `temperature=0`.** For RAG you want the model **reading**, not writing. Turn it up to 1 live and re-run the same question a few times; watch the answer drift while the source text sits unchanged.

🧑‍🏫 **Trainer note — grounding is not a guarantee.** A determined model can still blend training knowledge in, especially on famous topics. (TechSolutions being fictional actually helps here — there is nothing to leak.) The prompt makes it *much* rarer, not impossible. That honesty matters, and Day 5's evaluation is how you catch it.

❓ **Ask:** *"We told it to say exactly 'I don't know based on the company documents'. Why specify the exact words?"* → *because your code downstream can detect it — log it, count it, show a "contact HR" button, route to a human. A refusal you can pattern-match is a feature; a differently-worded apology every time is not.*

---

## 4️⃣ Citations — trust comes from metadata — 18 min  `[Core]`

An answer nobody can verify is an answer they have to take on faith.

```python
def answer_with_sources(question, n_results=3):
    """Retrieve, answer from context, and report where the text came from."""
    results = collection.query(
        query_embeddings=embedder.encode([question]).tolist(),
        n_results=n_results
    )
    context = "\n\n".join(results['documents'][0])
    answer = (RAG_PROMPT | llm | StrOutputParser()).invoke(
        {"context": context, "question": question}
    )
    return answer, results['metadatas'][0], results['distances'][0]
```

Three things come back from one Chroma call: the **text**, the **metadata** (→ citations) and the **distances** (→ confidence, used in §5).

⚠️ **The rule to hammer:** **never ask the model to produce the citation.** A model told to "cite your source" will cheerfully invent a plausible-looking reference — precisely the behaviour you are trying to eliminate. The section name here was attached at split time, stored with the chunk, and printed by **your** code. The model never touched it.

💡 **AHA:** *"The answer is **generated**. The citation is **retrieved**. Those are two completely different trust levels, and mixing them up is how you ship a bot that invents case law."*

🧑‍🏫 **Trainer note:** this is also the debugging view. If an answer looks wrong, print the returned chunks — you will see instantly whether retrieval or generation is at fault. Tie it back to the board.

❓ **Ask:** *"A legal-research product cited three court cases that don't exist. Where in this pipeline did that team go wrong?"* → *they let the model write the citations instead of carrying them through as metadata. (This has happened, with real professional consequences.)*

---

## 5️⃣ When retrieval fails — the fix kit — 32 min  `[Core]`  ← protect this

Grounding stops the model inventing. It does **not** help when the right chunk was never retrieved — then a well-behaved system politely says "I don't know" about something that is in the document. That is now your most common bug.

**Always start the same way: look at what was retrieved.**

```python
for i, doc in enumerate(retrieve(question), 1):
    print(f"[{i}] {doc[:110]}...")
```

### 5.1 `n_results` — retrieve more  `[Core]`

The cheapest fix first. More chunks = better odds, *and* a longer, costlier, noisier prompt. Cite ["Lost in the Middle"](https://arxiv.org/abs/2307.03172): models attend best to the **start and end** of their context, so burying the good chunk among ten others can make things **worse**. The answer is *retrieve broad, then narrow* — which is reranking (5.4).

### 5.2 A distance cut-off — refuse before you pay  `[Core]`

They already have `distances` from Chroma, and yesterday's rule applies: **lower is closer**.

```python
def retrieve_or_none(question, max_distance=1.2, n_results=3):
    """Return chunks only if the best one is close enough."""
    results = collection.query(
        query_embeddings=embedder.encode([question]).tolist(), n_results=n_results
    )
    if results['distances'][0][0] > max_distance:
        return None
    return results['documents'][0]
```

⚠️ **Picking that number is genuinely hard** — distance bands are model- and data-specific, the same warning as yesterday's similarity thresholds. Too tight and you refuse answerable questions; too loose and it does nothing. Tune it against the golden set (§6), never by feel.

🧑‍🏫 **Trainer note — be precise about what this buys you.** The grounding prompt *already* handles irrelevant context gracefully. The cut-off's real value is **cost and latency**: it lets you skip the API call entirely. Frame it as an optimisation, not as the thing that makes refusal work.

### 5.3 Query rewriting  `[Core]`

**Users don't write search queries. They write questions** — vague, conversational, full of pronouns.

| A student types | What would actually retrieve well |
| ----- | ----- |
| "what do I get if I join?" | "employee benefits insurance learning budget bonus" |
| "who runs the company?" | "CEO CTO founder leadership" |
| "where did he study?" *(a follow-up)* | "Rahul Verma education BITS Pilani" |

```python
rewriter = REWRITE_PROMPT | llm | StrOutputParser()
```

Costs one extra LLM call; often the single biggest quality win in a chat product.

🧑‍🏫 **Trainer note:** the third row is the one that matters for §6. A bare follow-up like *"where did he study?"* embeds to almost nothing useful. Rewriting **with the conversation history** is what makes multi-turn RAG work at all.

### 5.4 Hybrid search  `[Extended]`

Vector search is strong on meaning, weak on **exact strings** — ask for "HDFC" and you may get paragraphs *about* clients that never contain the name. Keyword search (BM25) is the mirror image. Production runs both and merges.

**Reciprocal Rank Fusion** — merge by position, not by score:

```
score(chunk) = sum over both lists of  1 / (60 + rank)
```

💡 **AHA:** *"RRF needs no tuning and no normalisation — cosine distances and BM25 scores aren't even in the same units. It only asks 'what position did each list put this in?' A chunk both methods like wins; a chunk only one method loves still gets a chance."*

### 5.5 Reranking  `[Extended]`

The embedding model encoded every chunk **before it ever saw the question**. That is what makes search fast — and approximate. A **reranker** looks at the question and one chunk **together** and scores that pair properly.

```
retrieve 6 (fast, approximate) → rerank (slow, accurate) → keep top 3 → LLM
```

| | Bi-encoder (retrieval) | Cross-encoder (reranking) |
| ----- | ----- | ----- |
| Sees | query and doc **separately** | query and doc **together** |
| Speed | millions of docs, milliseconds | one pair at a time |
| Use for | narrowing to ~20 candidates | ordering those 20 properly |

The notebook's demo question is *"Who has an advanced degree?"* — a good one, because the answer chunks say "MBA from Stanford" and "graduated from BITS Pilani" without ever using the word "advanced".

🧑‍🏫 **Trainer note:** the notebook reranks with `gpt-4o-mini` because students already have that key. **In production you would not.** A dedicated cross-encoder — free and local `cross-encoder/ms-marco-MiniLM-L-6-v2` (same `sentence-transformers` library as their `embedder`), or hosted [Cohere Rerank](https://docs.cohere.com/docs/rerank) — is 10–100× faster and cheaper for the same job. *(Latest 2026 — re-check on the day.)*

### The fix kit — one table to remember

| Symptom | Reach for | Cost |
| ----- | ----- | ----- |
| right chunk just missed the cut | bigger `n_results` | longer prompt |
| question is vague or conversational | **query rewriting** | +1 LLM call |
| exact terms, codes, names missed | **hybrid search** | none |
| right chunk retrieved but ranked 5th | **reranking** | +1 call / latency |
| nothing relevant exists in the corpus | **distance cut-off** + the grounding prompt | none |
| three chunks all say the same thing | **MMR** (a diversity-aware ranking) | none |

🧑‍🏫 **Trainer note on MMR:** named, not built. Maximal Marginal Relevance picks chunks that are relevant **and unlike each other**, so you don't spend all three slots on near-duplicates. Most vector stores expose it as a search type. Worth 30 seconds so they recognise the term.

❓ **Ask:** *"Your bot finds nothing when users search 'HDFC'. Which tool, and why?"* → *hybrid search. It's an exact token; vectors are bad at those and BM25 is excellent at them.*

---

## 6️⃣ Measure it, then ship it — 30 min  `[Core]`

### Every knob in §5 is a guess until you measure it

Take a handful of real questions, write down a fact that **must** appear in the retrieved chunks, count how often it does.

```python
GOLDEN = [
    ("How much is the learning budget?",               "50,000"),
    ("Who is the CTO?",                                "Rahul Verma"),
    ("What is the notice period for permanent staff?", "2 months"),
    ("How many paid leaves per year?",                 "24 paid leaves"),
    ("What is the health insurance coverage?",         "5 lakh"),
    ("Who are the major clients?",                     "HDFC"),
]
```

One number — **hit rate @ k** — and suddenly these stop being opinions:

- Does `n_results=1` still work?
- Is hybrid search better *on this corpus*?
- Was `chunk_size=200` a good choice?

💡 **AHA:** *"This is the honest answer to 'what chunk size should I use?' — you **measure** it. Not vibes, not a blog post. Six questions written in ten minutes beats an afternoon of staring at code."*

⚠️ Two honest caveats: a golden set of 6 is a **teaching** size (aim for 30–100 real user questions), and this measures **retrieval only** — it says nothing about whether the final answer was good. Judging answers (LLM-as-judge, faithfulness, RAGAS) is **Day 5**.

### Ship it

A notebook cell is not a product. The chat interface introduces one genuinely new problem:

> "Who is the CTO?" → *Rahul Verma*
> "**Where did he study?**" ← embed *that* on its own and you retrieve nothing useful.

The fix is §5.3's rewriter, now given the conversation:

```python
def rag_answer(message, history):
    if history:
        recent = "\n".join(f"{m['role']}: {m['content']}" for m in history[-4:])
        search_query = rewriter.invoke({"question": f"{recent}\nFollow-up: {message}"})
    else:
        search_query = message

    results = collection.query(                                # retrieve on the REWRITTEN query
        query_embeddings=embedder.encode([search_query]).tolist(), n_results=3
    )
    answer = (RAG_PROMPT | llm | StrOutputParser()).invoke(
        {"context": format_docs(results['documents'][0]), "question": message}   # answer the REAL one
    )
    sections = sorted({m['section'] for m in results['metadatas'][0]})
    return f"{answer}\n\n*Source: {', '.join(sections)}*"
```

💡 **AHA — the split that matters:** *"Retrieve on the rewritten query. Answer the question the user actually asked. Mix those two up and your bot starts answering questions nobody asked."*

Then `gr.ChatInterface(rag_answer, type="messages").launch(share=True)` and the room opens it on their phones.

🧑‍🏫 **Trainer note:** the examples list deliberately includes **"Who is the CFO?"** Let a student tap it in front of everyone and watch the refusal land. That is the whole day in one screenshot.

### What production adds (name it, don't build it)

| Concern | The reality |
| ----- | ----- |
| **Cost** | one question ≈ 1 embedding call + 1–2 chat calls. Rewriting and reranking each add a call. |
| **Latency** | rewriting +100–300 ms, reranking +100–500 ms. Budget them; don't add both by reflex. |
| **Freshness** | the document changed — re-index. Indexing is offline, so this is a job, not a request. |
| **Access control** | filter by metadata *before* searching, so a user can never retrieve a document they can't read. |
| **Observability** | log the query, the rewritten query, the retrieved chunk ids and the answer. Without this you cannot debug a complaint. ([LangSmith](https://smith.langchain.com/) does this for LangChain apps.) |

❓ **Ask:** *"You add query rewriting AND reranking to every request. What did you just spend?"* → *two extra LLM calls and up to ~800 ms on every single question — including the easy ones. Apply them where they pay; measure first.*

---

## 🧪 In-class exercises  `[Core]`
Fill-in-the-blank versions are in the notebook (§14) — these are the same tasks in prose.

1. **Your first chain** — build `prompt | llm | StrOutputParser()` and invoke it. Then remove the parser and look at what comes back instead.
2. **Read the metadata** — retrieve for a question of your own and print the section each chunk came from.
3. **Make it refuse** — wrap `retrieve` in `RunnableLambda`, build your own grounded chain, then ask something the documents never mention.
4. **Measure a change** — add a question to the golden set, then compare hit rate at `n_results=1` and `5`.
5. **Cite your sources** — return an answer together with the sections it came from.

---

## 📝 Revision & Quiz — 8 min  `[Core]`
*(answers in italics — trainer copy)*

1. What are the two things inside a LangChain `Document`? — *`page_content` and `metadata`.*
2. Why can components be joined with `|`? — *they all implement the same interface (`.invoke()`/`.stream()`), so any one fits where another was.*
3. What does `RunnableLambda` do, and why did we need it today? — *wraps any Python function as a chain component; it turned our own `retrieve()` into a LangChain retriever.*
4. What does `RunnablePassthrough()` do in the RAG chain? — *passes the input through unchanged, so the question reaches the prompt as-is while the retriever works on it in parallel.*
5. Name the two rules of the grounding prompt. — *use ONLY the provided context; say "I don't know" if the answer isn't there.*
6. Why `temperature=0` for RAG? — *you want the model reading and reporting, not inventing.*
7. Where do citations come from? — *the chunk metadata, attached at split time — never from the model.*
8. An answer is wrong. What is the very first thing you print? — *the retrieved chunks — to tell a retrieval failure from a generation failure.*
9. Chroma returns `distances`. Higher or lower is better, and what can you use them for? — *lower is closer; a cut-off lets you refuse before paying for an LLM call.*
10. Why does hybrid search exist? — *vector search is weak on exact strings (codes, IDs, names) and keyword search is weak on meaning; they fail in opposite directions.*
11. What is a golden set, and what does hit-rate@k tell you? — *a small set of real questions plus a fact that must be retrieved; the fraction whose fact appears in the top-k — a retrieval-only score.*
12. Why rewrite a follow-up question before retrieving? — *"where did he study?" has no searchable content on its own; the rewriter uses the history to make it standalone.*
13. If a tutorial uses `RetrievalQA`, what does that tell you? — *it's written for pre-1.0 LangChain; that class now lives in the retiring `langchain-classic` package. Use an LCEL chain.*

---

## 🏠 Homework
1. **Swap the document** — replace `SECTIONS` with something you actually care about (your notes, a syllabus, a product manual). Everything below §6 of the notebook should work unchanged.
2. **Write a golden set of 10** questions for *your* document, and record hit rate at `n_results=1`, `3` and `5`. Bring the three numbers.
3. **Break it on purpose** — find one question where retrieval fails, fix it with exactly **one** technique from §5, and write down which one and why it was the right choice.
4. `[Extended]` **Cost it** — count the API calls one chat turn makes with rewriting on, then off. Estimate the cost of 1,000 questions a day.

---

## 🔗 Resources (verify on teaching day)
- **LangChain — LCEL & Runnables:** https://python.langchain.com/docs/concepts/lcel/
- **LangChain — retrievers:** https://python.langchain.com/docs/concepts/retrievers/
- **Lost in the Middle (Liu et al., 2023):** https://arxiv.org/abs/2307.03172
- **Query Rewriting for RAG (Ma et al., 2023):** https://arxiv.org/abs/2305.14283
- **Cohere Rerank:** https://docs.cohere.com/docs/rerank · **free local cross-encoder:** https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- **RAGAS (evaluation at scale):** https://docs.ragas.io/ *(Day 5)*
- **Chroma docs:** https://docs.trychroma.com/

> **Next — Day 5:** AI agents — models that decide *which* tool to use and when, with memory and planning — plus production GenAI: cost, evaluation and responsible AI.
