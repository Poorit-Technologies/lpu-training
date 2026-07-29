# Day 3 · AI — Embeddings, Vector Search & Chunking

**Date:** ______ · **Block:** Generative AI · **Notebook:** [Day03_AI.ipynb](../notebooks/Day03_AI.ipynb) · **Previous:** [Day 2 · AI](Day_02_AI.md)

> **Trainer context:** Day 1 made the model **answer**. Day 2 made it answer **reliably**, in a **shape you can trust**, and **act** through tools. But every one of those answers came from what the model memorised during training. Today we solve the last gap: **how do you get *your* data — your PDFs, your notes, your policy docs — in front of a model that has never seen them?** The answer is retrieval, and retrieval runs on **embeddings**. Today you build a working semantic search engine, then bolt an LLM on the end in five lines. Tomorrow (Day 4) that becomes a real RAG application.

> ⏱️ **How to use this file:** sections are tagged **`[Core]`** (teach live) or **`[Extended]`** (demo if time, else reading/homework). If you run short, trim Extended first — but **protect §2 (embeddings) and §4 (chunking)**. §2 is the concept everything rests on; §4 is the thing students get wrong for the rest of their careers.

## 🎯 Objectives
By end of day a student can:
- Explain why **keyword search fails** on meaning, and what an **embedding** is (text → a fixed-length vector).
- Generate embeddings with the free local **`all-MiniLM-L6-v2`** (384-d), and compare against hosted **`text-embedding-3-small`** (1536-d) via LiteLLM.
- Score meaning with **`cosine_similarity`** and read a similarity matrix.
- **Visualise** an embedding space — squash 384 dimensions to 2 with PCA and watch topics cluster.
- **Chunk** a document with **`RecursiveCharacterTextSplitter`** — and say why a naive fixed-size split destroys facts.
- Store, filter and query vectors in **Chroma**, and name when to reach for FAISS / pgvector / a managed DB instead.
- Wire the full **index → embed → store → query → top-k** pipeline, and see how those top-k chunks become **RAG**.

---

## 🔁 Kickoff — recap + hook — 8 min  `[Core]`

**30-second recap of Day 2:** few-shot teaches by example · chain-of-thought buys multi-step accuracy · `parse()` + Pydantic gives a **guaranteed shape** · function calling = the model **requests**, your code **runs** · that loop is an agent skeleton.

❓ **Ask the class (one open question):** *"Your college hands you a **200-page examination-policy PDF** and says: build a bot that answers student questions about it. You cannot paste 200 pages into every prompt — context window and cost. **How do you find the three right paragraphs?**"*

Let answers surface. You'll usually get, in this order:
1. *"Ctrl+F / search for keywords"* → good, and it's exactly what fails. Hold it for §1.
2. *"Train the model on it / fine-tune"* → expensive, slow, and it still won't quote the document. Name it, park it.
3. *"Summarise it first"* → you lose the detail that the question was about.
4. *"Search it somehow, then give the model just that bit"* → 🎯 **that's today.**

💡 **AHA:** *"Yesterday the model acted on data you handed it. Today it **finds** the data itself — from documents nobody trained it on."*

🧑‍🏫 **Trainer note:** write on the board and leave it up all day:
`documents → chunk → embed → store   |   query → embed → search → top-k`
Every section fills in one arrow. Point back at it constantly.

---

## 1️⃣ Keyword search vs meaning search — 12 min  `[Core]`

Every search you've written so far matches **strings**: `Ctrl+F`, `WHERE body LIKE '%refund%'`, a `grep`. It asks *"do these letters appear?"* — not *"is this about the same thing?"*

Take one real pair:

| The student asks | The document says |
| ----- | ----- |
| "How do I **cancel** my **order**?" | "**Returns and refunds policy**" |

**Words in common: zero.** Keyword search scores this a perfect miss — and it is the single most relevant page in the manual.

The failure runs in both directions:
- **Vocabulary mismatch (misses):** *cancel / return / refund / send back* all mean one thing to a human and four things to `LIKE`.
- **Ambiguity (false hits):** search `apple` and get the fruit, the company, and someone's surname — the letters match, the meaning doesn't.

💡 **AHA — the jump:** *"If we could turn every piece of text into **numbers**, where texts with similar meaning land on **nearby numbers**, then 'search by meaning' becomes plain geometry — just measure which points are close."*

That is the whole idea of an embedding. Everything else today is mechanics.

❓ **Ask:** *"Give me two ways a student might phrase 'when do results come out?' with no shared words."* → *"result date", "when will marks be published", "how long till grades"*. Prove the problem with their own sentences.

🧑‍🏫 **Trainer note:** don't dismiss keyword search — it's still better for **exact tokens**: order IDs, error codes, product SKUs, names. The production answer is usually **hybrid** (keyword + vector); flag it now, revisit in §5.

---

## 2️⃣ Embeddings — text as coordinates — 25 min  `[Core]`  ← the concept everything rests on

An **embedding** is a **list of numbers that represents the meaning of a piece of text**. You get it from an **embedding model** — a different model from the chat models of Day 1–2.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')   # free, local, runs on the Colab CPU

texts = [
    "Machine learning is a branch of AI",
    "Deep learning uses neural networks",
    "I love cooking Indian food",
    "Cricket is popular in India",
]

embeddings = model.encode(texts)
print(embeddings.shape)      # (4, 384) -> 4 texts, 384 numbers each
```

🧑‍🏫 **Trainer note — no API key needed here.** The local model means §1–§4 run for every student regardless of credits. The hosted model arrives in §2b as a *comparison*, not a dependency.

Three facts to land hard:

**(a) Every text becomes the *same* number of values.** Three words or three paragraphs — always 384 floats for this model. Change one sentence to a whole paragraph, re-run, and the shape is still `(4, 384)`. That fixed size is what makes comparison possible at all.

**(b) Position encodes meaning.** Think of a world map: two numbers (latitude, longitude) place any city, and cities that are *near in the numbers* are *near in reality*. An embedding is that idea with 384 axes instead of 2 — far too many to draw, but the same rule holds: **close vectors = close meaning**.

**(c) The words are gone.** At search time nothing compares text to text. You are comparing 384 numbers to 384 numbers.

💡 **AHA:** *"'Machine learning is a branch of AI' and 'Deep learning uses neural networks' share **almost no words** — but their vectors point in nearly the same direction, far closer than either is to cricket or cooking. The meaning survived the trip into numbers."*

### 2b · The hosted model, for comparison — LiteLLM

```python
from litellm import embedding

response = embedding(model="text-embedding-3-small", input=texts)

len(response.data[0]["embedding"])   # 1536
embeddings.shape[1]                  # 384  (the local model)
```

**Same four sentences, two completely different coordinate systems.** That contrast is the cleanest way to land the "same model on both sides" rule that follows.

### The model you'll use

| Model | Dimensions | Price (per 1M tokens) | Notes |
| ----- | ----- | ----- | ----- |
| **`all-MiniLM-L6-v2`** (local) | **384** | **free** | runs on CPU in Colab, no API key — **what we build with today** |
| **`text-embedding-3-small`** | **1536** (shrinkable to 256) | **$0.02** | the hosted default; better quality, shown in §2b |
| `text-embedding-3-large` | 3072 (shrinkable) | $0.13 | better still, bigger/costlier index |
| `text-embedding-ada-002` | 1536 | $0.10 | the old one — no reason to pick it now |

💡 **AHA — it's basically free:** at $0.02 per million tokens, embedding **an entire novel costs under one rupee**. Cost is never the reason you don't index something. *(Latest 2026 pricing — re-check on the day.)*

🧑‍🏫 **Trainer note — the `dimensions` knob:** `text-embedding-3-small` also accepts `dimensions=256`, returning a shorter vector that still works — smaller index, faster search, a small accuracy cost. Mention it; you don't need to demo it.

### Four rules students must not break

1. **Use the *same* model for documents and queries.** Two models = two incompatible coordinate systems. The search doesn't error — it silently returns nonsense. (This is the #1 real-world bug in this space.)
2. **Change the model → re-embed everything.** Your stored vectors are only meaningful in the space they were made in.
3. **Embedding models don't chat.** No `temperature`, no system prompt, no answer — `model.encode()` (or the `embedding()` endpoint) returns numbers, not text.
4. **Respect the input limit.** `all-MiniLM-L6-v2` silently truncates past ~256 word-pieces; `text-embedding-3-small` takes ~8,191 tokens. Either way, longer text must be chunked — which is §4.

🧑‍🏫 **Trainer note — beyond text:** the same idea powers image search (CLIP), audio search, and code search. "Turn a thing into a vector where near = similar" is one of the most reusable ideas in modern AI. Google Photos finding "dog" in your untagged pictures is this.

❓ **Ask:** *"You index 10,000 support tickets with `all-MiniLM-L6-v2` (384-d), then embed the queries with `text-embedding-3-small` (1536-d). What happens?"* → *here the dimensions differ, so Chroma will actually complain — a lucky escape. Now make both 1536-d with two different providers: **no error at all**, just silent nonsense. That's the version that reaches production.*

---

## 3️⃣ Cosine similarity — measuring "close" — 20 min  `[Core]`

We have vectors. We need a **single number** for "how close are these two?"

The standard answer is **cosine similarity** — it measures the **angle** between two vectors, ignoring their length:

```python
from sklearn.metrics.pairwise import cosine_similarity

similarity_matrix = cosine_similarity(embeddings)      # every text vs every text

similarity_matrix[0][1]    # ML vs DL      - similar topics
similarity_matrix[0][2]    # ML vs cooking - unrelated
```

- one call gives you the **whole matrix**, not just one pair
- the diagonal is always `1.000` — every text is identical to itself
- under the hood it's still just `dot(a, b) / (|a| · |b|)` — the cosine of the angle
- the ratio = the cosine of the angle → **1.0 = same direction, 0 = unrelated, −1 = opposite**

### Why angle and not distance?

Vector **length** tracks things like how long or emphatic the text is. Vector **direction** carries the meaning. "Great product" and a five-paragraph rave point the *same way* but have very different lengths — Euclidean distance would call them far apart, cosine correctly calls them near.

🧑‍🏫 **Trainer note:** both `all-MiniLM-L6-v2` and the OpenAI models return vectors you can treat as **length 1**, so cosine similarity and the plain dot product come out the *same number*. Worth saying out loud when a student asks why library code sometimes skips the division.

### Reading the numbers

| Roughly | Means |
| ----- | ----- |
| **0.9 – 1.0** | near-identical / paraphrase |
| **0.7 – 0.9** | clearly related, same topic |
| **0.5 – 0.7** | loosely related |
| **below 0.4** | unrelated |

⚠️ **These bands are model-specific.** Never hard-code "similarity > 0.8 means relevant" without testing it on *your* model and *your* data. What is reliable is the **ranking** — which is why we always take **top-k**, not "everything above a threshold."

💡 **AHA — run it live:**

| Query: "How do I cancel my order?" | ~cosine |
| ----- | ----- |
| "What is your return policy?" | **0.62** |
| "I want to send this item back" | **0.58** |
| "The Eiffel Tower is in Paris." | **0.04** |

Zero shared words with the top hit, and it still wins by 15×. *That* is the moment the concept lands.

❓ **Ask:** *"Cosine ignores length. Give me a case where that's exactly wrong."* → *e.g. distinguishing a one-word query from a detailed spec — sometimes you want length to matter, which is why hybrid/re-ranking exists.*

---

## 3️⃣b Seeing the space — 12 min  `[Core]`  ⭐ the moment it clicks

A table of numbers convinces. A **picture** is remembered.

Nobody can picture 384 dimensions — but you can **squash** them to 2 and look at the shadow. That's
**PCA**: keep the two directions carrying the most variation, discard the rest.

```python
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

many_vectors = model.encode(many_texts)          # (9, 384)
coords = PCA(n_components=2).fit_transform(many_vectors)   # (9, 2)

plt.scatter(coords[:, 0], coords[:, 1], c=colors, s=160)
```

Nine sentences — three about **AI**, three about **food**, three about **sport** — and they land in
three clean clusters on the plot.

💡 **AHA — say this twice:** *"We never passed a label, a category or a tag. Only nine sentences. **The
grouping is what meaning looks like when you plot it.**"*

💡 **AHA — this is the whole day in one picture:** *"Semantic search is just: put the question on this
map, and return whatever is nearest."*

⚠️ **Be honest about the picture.** PCA discards 382 of 384 dimensions, so it's a **shadow, not the
truth** — two points that look close on screen may not be close in the real space. Build intuition from
the plot; **make decisions with `cosine_similarity`.**

🧑‍🏫 **Trainer move — add a bridging sentence live.** Type `"AI is used to analyse cricket matches"` into
`many_texts`, re-run, and watch it land *between* the AI and sport clusters. That single re-run kills the
idea that embeddings are just topic labels in disguise.

### 🌐 Show them a bigger space — the TensorFlow Embedding Projector

**<https://projector.tensorflow.org/>** — nothing to install, loads 10,000 Word2Vec words in interactive 3-D.
Two minutes on the projector is worth ten of explanation:

1. Open it — Word2Vec 10K loads by default
2. Search **`india`** on the right → read the nearest neighbours aloud
3. Switch **PCA → t-SNE** and watch the clusters reorganise live
4. Try **`king`**, then **`teacher`**, then a word from the students' own field

❓ **Ask:** *"The plot shows three clusters. Did we tell the model what the categories were?"* → *No. We
passed raw sentences only. The model has no idea what "sport" means as a label — it just places texts
that are used in similar ways near each other.*

---

## 4️⃣ Chunking — the part everyone gets wrong — 22 min  `[Core]`

You never embed a whole document. You cut it into **chunks** and embed each one. Four reasons:

1. **Meaning gets averaged away.** One vector for a 50-page handbook is a blurry summary of everything, so it's a good match for nothing. Ask about section 12 and the vector shrugs.
2. **You want to return the paragraph, not the book.** Precision is the point.
3. **Cost + context window.** Whatever you retrieve goes into a prompt later. Retrieving 50 pages defeats the exercise.
4. **Hard input limits.** ~8,191 tokens per embedding call.

💡 **AHA:** *"An embedding is one point in space. One point cannot represent a book that talks about forty things. Chunking gives each idea its own point."*

### Strategies

| Strategy | How | Good for | Cost |
| ----- | ----- | ----- | ----- |
| **Fixed-size** | every N characters/tokens | quick prototypes, uniform text | cuts sentences in half ❌ |
| **Sentence** | split on `.` / a sentence splitter | short-answer FAQs | chunks may be too small for context |
| **Paragraph / heading** | split on `\n\n` or on `##` headings | structured docs, notes, policies ✅ | needs structure to exist |
| **Recursive character** | try paragraph → sentence → word until it fits | **the sensible default ✅ — what we use** | one import |
| **Semantic** | split where the meaning shifts (embed sentences, cut on drops) | high-value corpora | slow + costs embeddings `[Extended]` |

### Size and overlap

- **Size:** ~200–500 tokens (≈ 800–2,000 characters) is the usual sweet spot. Dense FAQ text → smaller. Flowing prose or narrative → bigger.
- **Overlap:** repeat **10–20%** of the previous chunk at the start of the next one.

**Why this matters** — the failure to demo live (notebook §6). Slice the company profile every 200 characters with a three-line hand-rolled chunker:

```
chunk 2:  "... Rahul Verma is the CT"
chunk 3:  "O and co-founder. He graduated from BITS Pilani ..."
```

It sliced **CTO straight down the middle**. Ask *"who is the CTO?"* and **the word CTO does not exist in any chunk** — one ends in "CT", the next opens with a stray "O". The fact is gone, and no model can recover it.

🧑‍🏫 **Trainer note — teach the failure first, then the library.** The naive chunker exists in the notebook *purely to be broken*. Once they've seen it destroy a fact, `RecursiveCharacterTextSplitter` stops being "another import to memorise" and becomes the obvious fix:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
chunks = splitter.split_text(company_info)     # 16 chunks, every one ending on a whole word
```

It tries a **paragraph** break first, then a **sentence**, then a **word** — cutting mid-word only as a last resort. Chunk 4 now carries *"Rahul Verma is the CTO and co-founder"* intact. **Nothing changed but the boundaries.**

💡 **AHA:** *"Bad chunking beats a good model. You can pay for the most expensive model on earth and still lose to someone with a cheap model and sensible boundaries."*

### Metadata — do this from day one

Store fields alongside each chunk: `source`, `page`, `section`, `date`, `author`.

```python
collection.add(
    ids=[f"chunk_{i}" for i in range(len(chunks))],
    embeddings=model.encode(chunks).tolist(),
    documents=chunks,
    metadatas=[{"source": "policy_v3.pdf", "page": 12, "section": "Returns"}, ...],
)
```

Two payoffs: you can **filter before searching** ("only 2026 docs", "only this student's files"), and you can **cite** — *"Policy v3, page 12."* Citations come from your metadata, never from the model's memory.

🧑‍🏫 **Trainer note:** the honest engineering answer to "what chunk size?" is **you measure it**. Assemble 20 real questions, try two configurations, count how often the right chunk lands in the top 3. Chunking is tuned by evaluation, not by vibes — Day 5 covers evaluation properly.

❓ **Ask:** *"You have a 300-page policy PDF. Chunk it by page, or by heading?"* → *by heading. A page break is a **printing accident**; a heading is a **meaning boundary**. Never let the printer decide your chunks.*

---

## 5️⃣ Vector databases — 28 min  `[Core]`

Right now you have a Python list of vectors and a cosine loop. Be clear with the class: **that already is vector search**, and it's genuinely fine up to a few thousand chunks.

Here's what breaks as you grow:

| Problem | With a plain list | What a vector DB does |
| ----- | ----- | ----- |
| **Speed** | compare against **every** vector — O(n) | an **ANN index** (HNSW) — approximate, ~100× faster |
| **Persistence** | restart = vectors gone = re-embed = re-pay | stored on disk, load instantly |
| **Filtering** | write your own loop | `where={"year": 2026}` before the search |
| **Updates / deletes** | rebuild the array | add/update/delete by `id` |
| **Concurrency** | none | a real server |

💡 **AHA — approximate is a *feature*:** exact search checks all 10 million vectors. **ANN** (Approximate Nearest Neighbour) organises them so you check a few thousand — you might miss the true #7 result occasionally, and you get an answer 100× faster. *"~99% of the right answers in 1% of the time"* is a trade every production system takes.

### Chroma, hands-on

```python
import chromadb

chroma_client = chromadb.Client()               # in-memory (PersistentClient(path=…) to keep it)
collection = chroma_client.get_or_create_collection(name="techsolutions")

collection.add(
    ids=[f"chunk_{i}" for i in range(len(chunks))],   # your IDs — needed to update/delete later
    embeddings=model.encode(chunks).tolist(),         # Chroma wants a list, not a numpy array
    documents=chunks,                                  # the original text, stored alongside
)

results = collection.query(
    query_embeddings=model.encode(["Who founded the company?"]).tolist(),
    n_results=3,
)
print(results["documents"][0])                   # the top-3 chunk texts
```

🧑‍🏫 **The `.tolist()` is the one students forget.** `model.encode()` hands back a numpy array; Chroma wants plain Python lists. The error is not obvious — call it out before they hit it.

⚠️ **Two things that trip everyone up:**
- Chroma returns **`distances`, not similarities** — **lower is better**. For cosine space, `similarity ≈ 1 − distance`.
- Results are **lists of lists** (`res["documents"][0]`) because `query` accepts a *batch* of queries. Index `[0]` for your single query.

🧑‍🏫 **Trainer note:** Chroma can embed for you — pass `documents=` with no `embeddings=` and it uses a built-in model. We pass vectors **explicitly** today so the pipeline stays visible. Mention the shortcut; teach the long way.

### The landscape — when to reach for what

| Tool | It is… | Reach for it when |
| ----- | ----- | ----- |
| **Chroma** | a simple local vector DB | prototypes, demos, small apps ✅ *(today)* |
| **FAISS** | a fast similarity **library** (Meta) | raw speed / research; you handle storage + metadata yourself |
| **pgvector** | a **Postgres extension** | you already run Postgres — vectors live next to your rows ⭐ |
| **Pinecone** | managed, hosted | production, no ops team, pay per use |
| **Qdrant · Weaviate · Milvus** | production vector DBs (self-host or cloud) | scale + control |
| **Elasticsearch / OpenSearch** | search engines with vector support | you need **hybrid** keyword + vector |

⭐ **The bridge worth naming:** next week you'll build a **Postgres** backend. `pgvector` means your embeddings can be a **column in the same database** as your users and orders — one database, one backup, one connection, joins across both. For most teams that's the right answer, not a separate vector service.

🧑‍🏫 **Trainer note — hybrid search:** keyword (BM25) and vector search fail in *opposite* ways. Vector search is great at meaning and bad at exact strings — ask it for order `A123` and it may hand you `A124`. Serious systems run both and merge the rankings. Name it; don't build it today.

❓ **Ask:** *"5,000 chunks, one user, a Colab notebook. Do you need a vector database?"* → *No. A numpy array is genuinely fine. Reach for the DB when you need persistence, filtering, or scale — not because it sounds professional.*

---

## 6️⃣ Put it together — a semantic search engine — 20 min  `[Core]`

Now assemble the board diagram. Name the two phases explicitly — students conflate them constantly:

**Phase 1 · Indexing** (offline, once, whenever documents change)
```
documents → chunk → embed → store (vectors + text + metadata)
```

**Phase 2 · Querying** (online, every single request)
```
query → embed (SAME model) → search → top-k chunks
```

The class corpus: the **TechSolutions India** company profile — founders, product prices, leave policy, benefits, clients. Ask it questions whose words don't appear in the document at all:

| Ask this | The document actually says |
| ----- | ----- |
| *"Who are the big **customers**?"* | "…major **clients** include HDFC Bank, Tata Motors…" |
| *"**work from home** policy"* | "…hybrid model with 3 days in office and 2 days **remote**" |
| *"How many **holidays** do staff get?"* | "…employees receive 24 paid **leaves**…" |

💡 **AHA:** *"None of those queries share the document's words — and the right chunk comes back every time. Nobody wrote a single keyword rule."*

🧑‍🏫 **Trainer tip — get a wrong result on purpose.** Ask something the document never mentions — *"what is the hostel fee?"* — and show that the search **still confidently returns three chunks**. Similarity search *always* returns its top-k; it has no concept of "nothing here is relevant." That failure mode is the whole reason Day 4 spends time on grounding and "I don't know."

❓ **Ask:** *"Which phase runs on every user request — and what does that mean for latency?"* → *only querying: one embedding call plus a search, tens of milliseconds. Indexing is done once, offline. That split is why RAG is fast enough to ship.*

---

## 7️⃣ The five-line RAG teaser — 10 min  `[Core]`

You have the three most relevant chunks. Day 1 gave you a model that writes. Snap them together:

```python
from litellm import completion

question = "Who is the CTO and what is his background?"
context  = "\n\n".join(search(question, n_results=3)["documents"][0])

answer = completion(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "Answer using ONLY the context below. If it isn't there, say you don't know.\n\n" + context},
        {"role": "user",   "content": question},
    ],
    temperature=0,          # for RAG you want reading, not inventing
)
print(answer.choices[0].message.content)
```

🧑‍🏫 **Why `temperature=0` here.** Everywhere else you might dial creativity up; in RAG the model's job is to *report what the context says*. Turning the randomness off is part of the grounding story — name it, it comes back on Day 4.

**That is RAG** — **R**etrieval **A**ugmented **G**eneration:
- **Retrieval** — today's entire lesson: find the right chunks.
- **Augmented** — paste them into the prompt as context.
- **Generation** — Day 1's chat call, unchanged.

💡 **AHA — why this kills hallucination:** on Day 1 the model **recalled** from training and invented details when it didn't know. Here it **reads** text you handed it a millisecond ago. It stops being a memory and starts being a reader.

🧑‍🏫 **Trainer note — sell tomorrow, don't teach it today.** Five lines gets a demo working; a *product* needs the hard parts, and that's Day 4: making it actually say "I don't know", citations from metadata, what to do when retrieval returns junk, re-ranking, and measuring whether it's any good.

Close on: *"Retrieval was the hard 90%. You built it today."*

---

## 🧪 In-class exercises  `[Core]`
Fill-in-the-blank versions are in the notebook (§10) — these are the same tasks in prose.

1. **Similarity ladder** — embed one query and four sentences (one paraphrase, one same-topic, one different-topic, one nonsense). Rank them by cosine and check the order matches your intuition.
2. **Break the chunker** — chunk a paragraph at 40 characters with no overlap, then query for a fact that straddles a boundary. Watch it fail. Add overlap; watch it recover.
3. **Filtered search** — add `metadata={"day": 1 or 2}` to your chunks, then run the *same* query with `where={"day": 1}` and with no filter. Compare the top hit.
4. **Bridge the clusters** — add a sentence that belongs to two topics at once (`"AI is used to analyse cricket matches"`) to the visualisation set, re-run the PCA cells, and describe where it lands and why.
5. **Two models, one question `[Extended]`** — index the chunks with `all-MiniLM-L6-v2`, then run a query embedded with `text-embedding-3-small`. Watch it break. Fix it, and say in one sentence why.

---

## 📝 Revision & Quiz — 8 min  `[Core]`
*(answers in italics — trainer copy)*

1. What is an embedding, in one sentence? — *a fixed-length list of numbers representing the meaning of a piece of text.*
2. How many numbers does `all-MiniLM-L6-v2` return — and `text-embedding-3-small`? — *384 and 1536. Same sentences, two incompatible coordinate systems.*
3. Why must the query and the documents use the same embedding model? — *different models produce different coordinate spaces; mixing them returns nonsense with no error.*
4. Why cosine similarity rather than Euclidean distance? — *meaning is carried by the vector's direction; length mostly reflects text length/intensity.*
5. Give two reasons we chunk documents. — *one vector can't represent many ideas; you want the relevant paragraph, not the book; cost/context limits; the 8k-token input cap.*
6. What is chunk overlap for, and which splitter should you reach for? — *overlap means a fact split across a boundary still appears whole in a neighbouring chunk; use `RecursiveCharacterTextSplitter`, which breaks on paragraph → sentence → word rather than mid-token.*
6b. Why is a 2-D PCA plot of embeddings a *shadow* rather than the truth? — *it keeps only the two directions with the most variation and throws away the other 382, so on-screen distance is approximate. Decide with cosine similarity, not with your eyes.*
7. Name two things a vector DB gives you over a numpy array. — *ANN speed, persistence, metadata filtering, updates/deletes, concurrency.*
8. Chroma returns `distances`. Higher or lower is better? — *lower — it's a distance, not a similarity.*
9. Why store metadata with each chunk? — *to filter before searching, and to cite the real source.*
10. What are the three letters of RAG doing? — *Retrieval (find chunks) · Augmented (put them in the prompt) · Generation (the model answers from them).*

---

## 🏠 Homework
1. **Index something you own** — your own notes, a Wikipedia article, a PDF you care about. Chunk it, embed it, store it in Chroma, and answer five questions with semantic search.
2. **Tune it** — run the same five questions at two chunk sizes (e.g. 300 vs 1000 characters). Write down which retrieved better, and your guess at why. Bring the numbers to Day 4.
3. **Break it on purpose** — find one question where retrieval returns confident nonsense. That example is your ticket into tomorrow's lesson.
4. `[Extended]` **Compare models** — embed the same 5 sentences with the local `all-MiniLM-L6-v2` and with `text-embedding-3-small` via LiteLLM. Do the two *rankings* agree, even though the numbers are completely different?

---

## 🔗 Resources (verify on teaching day)
- **TensorFlow Embedding Projector** (interactive 3-D, 10k Word2Vec words): https://projector.tensorflow.org/ ⭐
- **Nomic Atlas** (big text/image embedding maps): https://atlas.nomic.ai/
- **Apple Embedding Atlas** (millions of points, runs locally): https://github.com/apple/embedding-atlas
- **Sentence-Transformers:** https://www.sbert.net/
- **`all-MiniLM-L6-v2` (free, local):** https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- **LangChain text splitters:** https://python.langchain.com/docs/concepts/text_splitters/
- **LiteLLM embeddings:** https://docs.litellm.ai/docs/embedding/supported_embedding
- **OpenAI — Embeddings guide:** https://platform.openai.com/docs/guides/embeddings
- **OpenAI — pricing:** https://openai.com/api/pricing/
- **Chroma docs:** https://docs.trychroma.com/
- **pgvector:** https://github.com/pgvector/pgvector *(the Week-2 bridge)*
- **MTEB leaderboard** (which embedding model is best right now): https://huggingface.co/spaces/mteb/leaderboard

> **Next — Day 4:** RAG end-to-end — grounding, citations, "I don't know", and what to do when retrieval fails.
