# Day 1 · AI — GenAI Foundations, Calling LLMs, and Where It Breaks

**Date:** ______ · **Block:** Generative AI · **Pairs with:** [Day 1 · Backend](Day_01_Backend.md) · **Tracker:** [../Course_Tracker.md](../Course_Tracker.md)

> **Trainer context:** This file teaches GenAI from **zero** — concepts first, then **calling real LLMs in Python**, then **how GenAI fails in the real world** so they build with eyes open. Every concept has a concrete example or something to run.

> ⏱️ **How to use this file:** it's deliberately bigger than one sitting. Sections are tagged **`[Core]`** (teach live, ~90 min) or **`[Extended]`** (demo if time, otherwise assign as reading/homework). Trim from the Extended tags first if you run short.

## 🎯 Objectives
By end of day a student can:
- Place **GenAI inside AI/ML/DL** and say what "generative" means.
- Explain **how an LLM works** (tokens, next-token, context, hallucination).
- **Call an LLM in Python** with the OpenAI client — for **OpenAI *and* Gemini** — and with **LiteLLM** to swap providers in one line.
- Get a **structured (Pydantic) output** from an LLM.
- Name real **GenAI failures** and the lesson each teaches.

---

## 🔁 Kickoff — 5 min  `[Core]`
❓ **Ask the class:** *"If a model **predicts a house price** (a number) versus **writes the property listing** (a paragraph) — what's fundamentally different about those two outputs?"* → a value/label **vs new content**. That's GenAI in one question.

---

## 1️⃣ AI → ML → DL → GenAI — 12 min  `[Core]`
Draw nested circles: **AI ⊃ ML ⊃ Deep Learning ⊃ GenAI**.

| Layer | What it means | Solid example |
| ----- | ----- | ----- |
| **AI** | any machine doing a "smart" task | Google Maps finding the fastest route |
| **ML** | learns patterns from **data** instead of hard-coded rules | a spam filter that learns from examples |
| **Deep Learning** | ML using **neural networks** on big/messy data | Google Translate; phone face-unlock |
| **Generative AI** | deep learning that **creates new content** | ChatGPT writing an email; text-to-image |

### The two classic ML jobs — with concrete examples
- **Regression → predict a *number*:** (1) house price from size & location · (2) a student's exam score from hours studied · (3) tomorrow's temperature.
- **Classification → predict a *category*:** (1) email spam vs not-spam · (2) a medical scan: benign vs malignant · (3) loan applicant will default: yes/no.
- **Deep Learning → neural nets on *unstructured* data:** (1) face recognition (phone unlock) · (2) speech-to-text (Alexa/Siri) · (3) language translation.

### Discriminative vs Generative — the key line
- **Discriminative** (regression & classification above): *draws a boundary* → outputs a **label or number** ("spam or not?", "price = ₹?").
- **Generative** (today): *models the data itself* → produces **new** samples ("write the email", "draw the house", "generate the code").

💡 **AHA:** *"Same neural-net machinery — different goal: **predict one value** vs **generate new content**."*
🧑‍🏫 **Trainer note:** put these examples on the board — students grasp "predict a value vs generate new content" far faster from examples than from definitions.

---

## 2️⃣ GenAI core concepts — how an LLM works — 20 min  `[Core]`

**Modalities:** GenAI isn't only text — it's **text, code, images, audio, video**. Today = text/code (LLMs). A model trained broadly enough to reuse across tasks is a **foundation model**.

**Next-token prediction** — the whole engine:
- An LLM answers one question, billions of times: **"given this text, what's the most likely next token?"**
- Repeat token-by-token → sentences, code, answers *emerge*.
💡 **AHA:** *"Everything it does is **just** next-token prediction at scale. The intelligence is emergent."*

**Tokens & tokenization (do it live):**
- Models see **tokens** (chunks, ~¾ word in English), not letters/words.
- 🔴 **AHA — live** on a tokenizer (**platform.openai.com/tokenizer**): paste `Generative AI`, then a line of **code**, then **Hindi/regional text** → the last two use **more tokens**.
- Why care: **you pay per token**, context is measured in tokens, non-English costs more.
❓ **Ask:** *"If Hindi uses ~2× the tokens of English, what happens to your app's bill?"*

**How it got smart (high level):** **1)** Pretraining (read a huge slice of the internet) → **2)** Fine-tuning / alignment (RLHF: be helpful, follow instructions, be safe) → **3)** a general assistant you steer with prompts.

**Context window & hallucination:**
- **Context window** = tokens it can "see" at once (~**1M** on 2026 flagships). No memory between calls beyond what you send.
- **Hallucination** = predicts *plausible* text, not *verified* truth → confidently makes things up.
💡 **AHA:** *"It's a brilliant **improviser**, not a database — that's exactly **why RAG exists** (Day 4)."*

---

## 3️⃣ The 2026 model landscape — 8 min  `[Core]`
| Provider | Flagship (2026) | Fast / cheap | Context |
| ----- | ----- | ----- | ----- |
| **Anthropic** | **Claude Opus 5** | Haiku 4.5 | very large |
| **OpenAI** | **GPT-5.6** (Sol/Terra/Luna) | smaller tiers | ~1M |
| **Google** | **Gemini 3.6** | Gemini 3.6 Flash | ~1M |
| **Open-weight** | Llama / Mistral / Qwen | (self-host) | varies |

🆕 **Latest (2026):** Opus 5 (Jul 24) tops intelligence benchmarks; GPT-5.6 is ChatGPT's default; Gemini 3.6 Flash is the cheap/fast pick. **~1M context, reasoning, multimodal are standard.**
🧑‍🏫 **Mental model:** *flagship for hard reasoning, cheap tier for high-volume simple tasks* (cost-vs-capability, revisited Day 5).
⚠️ **Verify exact model IDs on the day** — they change monthly.

---

## 4️⃣ Python building blocks for AI — 10 min  `[Extended]`
> These also appear in the **[Backend file](Day_01_Backend.md)** (from the API angle). Here we need only *enough to structure LLM inputs/outputs* — skip if you already taught it this morning.

**A class** = bundle data + behavior (we'll wrap LLM calls in small classes later):
```python
class ChatSession:
    def __init__(self, system: str):
        self.messages = [{"role": "system", "content": system}]
    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
```
**Pydantic** = define the *shape* of data and validate it — the backbone of **structured LLM output**:
```python
from pydantic import BaseModel

class StudentInfo(BaseModel):
    name: str
    age: int
    interests: list[str]
```
🧑‍🏫 **Tip:** frame Pydantic as *"the contract"* — you'll force the LLM's messy text into this exact shape in §5b.

---

## 5️⃣ Calling LLMs in Python — 25 min  `[Core]`  ← the practical centerpiece

### (a) OpenAI client → OpenAI
```bash
uv add openai
```
```python
from openai import OpenAI
client = OpenAI()                      # reads OPENAI_API_KEY from env

r = client.chat.completions.create(
    model="gpt-5.6",                   # ⚠️ exact id from provider docs
    messages=[
        {"role": "system", "content": "You are a concise CS tutor."},
        {"role": "user",   "content": "Explain what an API is in 2 sentences."},
    ],
    temperature=0.7,
)
print(r.choices[0].message.content)
```
💡 **AHA — temperature:** run at `0` twice (near-identical) then `1.2` twice (varied). *"Low = focused/repeatable, high = creative/random."*

### (b) SAME OpenAI client → Gemini
Gemini exposes an **OpenAI-compatible endpoint** — change only **3 things**: `api_key`, `base_url`, `model`.
```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GEMINI_API_KEY"],
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
r = client.chat.completions.create(
    model="gemini-3.6-flash",          # ⚠️ verify current id
    messages=[{"role": "user", "content": "Explain what an API is in 2 sentences."}],
)
print(r.choices[0].message.content)
```
💡 **AHA:** *"Three lines changed — key, base_url, model — and we're on a totally different company's model. **That's why 'OpenAI format' became the industry standard.**"*
🧑‍🏫 **Tip:** the compat endpoint covers chat, tools, embeddings, `temperature`, and JSON output — but **not** image-gen / TTS. For those, use Google's native SDK (mention, don't demo).

### (c) LiteLLM → one interface for *everything*
```bash
uv add litellm
```
```python
from litellm import completion   # keys read from env per provider

for model in ["openai/gpt-5.6", "gemini/gemini-3.6-flash", "anthropic/claude-opus-5"]:
    r = completion(
        model=model,
        messages=[{"role": "user", "content": "Say hello in 5 words."}],
    )
    print(model, "→", r.choices[0].message.content)
```
💡 **AHA:** *"One function. Swap the **model string** and you've switched providers — no new SDK, no rewrite."* LiteLLM speaks OpenAI format to **100+ providers** and adds cost tracking, fallbacks, and load balancing (why companies use it).
❓ **Ask:** *"Your app runs on GPT-5.6. Gemini drops its price 50% tomorrow. With LiteLLM, how much code changes?"* → *one string.*

### (5b) Structured output with Pydantic — `[Extended]`
Turn the model's text into a **validated Python object**:
```python
from pydantic import BaseModel

class Recipe(BaseModel):
    title: str
    ingredients: list[str]
    minutes: int

r = client.chat.completions.create(
    model="gpt-5.6",
    messages=[{"role": "user",
               "content": "Give a simple pasta recipe as JSON with keys: "
                          "title, ingredients (list), minutes (int)."}],
    response_format={"type": "json_object"},
)
recipe = Recipe.model_validate_json(r.choices[0].message.content)
print(recipe.title, "—", recipe.minutes, "min")
```
💡 **AHA:** *"The LLM's freeform text just became a typed object your code can trust — this is how AI plugs into a real backend."*

---

## 6️⃣ Prompt engineering — basics that work — 12 min  `[Core]`
Framework: **Role + Task + Context + Format** (+ **Examples** when needed).

💡 **AHA — weak → strong, live:**
- ❌ `tell me about sorting` → vague wall of text.
- ✅ `You are a DSA tutor. Explain bubble sort to a 2nd-year student in exactly 3 bullets, then give its time complexity.` → crisp, targeted.
> Same model. The **prompt** was the whole difference.

Four habits: **1)** be specific · **2)** give context (paste the data) · **3)** show the format (bullets/JSON/table) · **4)** iterate.
🧑‍🏫 **Tips:** ask for a **format** and models comply strikingly well; tell it **who to be** + **who it's for**; "think step by step" boosts reasoning (formalized as chain-of-thought on Day 2).

---

## 7️⃣ Real-world use cases — 8 min  `[Core]`
Where GenAI is actually earning its keep (tie each to their **capstone options**):
- **Support / chatbots** — answer from company docs (→ Healthcare Chatbot capstone).
- **RAG search** — "chat with your PDFs/knowledge base" (→ Day 4).
- **Coding assistants** — generate, explain, review, debug (→ AI Coding Assistant capstone).
- **Summarization & extraction** — long docs → bullets or structured data.
- **Content & translation** — drafts, rewriting, multilingual.
- **Analysis & tutoring** — resume feedback, quizzes (→ Resume Analyzer / Smart Learning capstones).
- **Agents** — LLM + tools that *take actions* (→ Day 5).
❓ **Ask:** *"Which of these would help LPU students most — and which would you never let run without a human check?"* (segues into failures).

---

## 8️⃣ When GenAI fails — real incidents — 12 min  `[Core]`
> Teach the **category**, anchored by a real case. Do 3 live, leave the rest as reading.

| Failure type | Real case | Lesson for their apps |
| ----- | ----- | ----- |
| **Hallucination** | **Air Canada's** chatbot invented a refund policy; a tribunal made the airline **pay** (Feb 2024). Lawyers keep filing **fake AI-generated case citations** (2023→2026). | Confident ≠ correct. **You** are liable for your bot's words. Verify high-stakes output. |
| **Bias** | **Google Gemini's** image generator drew historically wrong "diverse" images (Black founding fathers, mixed-race Nazis) → Google **paused** it (Feb 2024). **Fable's** OpenAI-powered reading recaps turned **racist** (Dec 2024). | Training data + clumsy guardrails cause harm. Test across groups before shipping. |
| **Prompt injection / jailbreak** | **Chevy** dealer bot talked into selling a Tahoe for **$1**, "legally binding, no takesies-backsies" (Dec 2023). **DPD's** bot **swore** and trashed its own company (Jan 2024). | Treat user input as untrusted. Never give a bot real authority without limits. |
| **Security / supply chain** | **"nullifAI"** — malicious models smuggled onto **Hugging Face**, slipping past its scanner via broken **pickle** files → **reverse shell** (Feb 2025). | Models are code. Don't blind-load weights; pin/scan sources. |
| **Misuse (deepfakes)** | **$25M** deepfake video-call fraud at engineering firm **Arup** (2024); impersonation & romance scams through 2025. | Generation is a weapon too — disclosure, watermarking, verification matter. |

**So what do we DO about it?** (write on board): verify outputs · test for bias · sanitize input + limit bot authority · scan/pin model sources · disclose AI + keep a human in the loop for anything costly.
💡 **AHA:** *"Every one of these was a **team that shipped without guardrails**. Knowing the failure modes is the job."*

---

## 🧪 In-class exercises  `[Core]`
✏️ **Micro (pairs, 5 min):** improve `write about databases` twice using **Role + Format**; compare outputs.
🧪 **Main (18 min):**
1. Call an LLM through **LiteLLM**, then **swap the model string** to a second provider — same code, different brain.
2. Get a **JSON answer** and validate it into a **Pydantic** model (use §5b).
3. Deliberately make it **hallucinate** (ask for a made-up author/paper). Note what it invented — *this is why we build RAG.*
4. Pick **one failure type** from §8 and, in one line, say how you'd prevent it in your app.

---

## 📝 Revision & Quiz — 8 min  `[Core]`
**Say it back:** GenAI *generates* · LLM = next-token predictor · tokens = cost/context unit · context window = working memory · it hallucinates → verify · OpenAI format is the universal shape · LiteLLM swaps providers in one string.

Quiz (*answers for me in italics*):
1. Discriminative vs generative? *Predict a label/number vs create new content.*
2. Core thing an LLM does? *Predict the next token.*
3. What's a token, and why does non-English cost more? *Text chunk (~¾ word); more tokens per word.*
4. To call **Gemini with the OpenAI client**, what 3 things change? *api_key, base_url, model.*
5. What does **LiteLLM** give you? *One OpenAI-format interface to 100+ providers; swap by model string.*
6. How do you turn LLM text into a **trusted object**? *Ask for JSON + validate with Pydantic.*
7. Air Canada's chatbot failure — which category? *Hallucination (+ liability).*
8. The Chevy "$1 Tahoe" — which category? *Prompt injection / jailbreak.*
9. Why is loading a random Hugging Face model risky? *Models are code; pickle files can run malware (nullifAI).*

---

## 🏠 Homework
- **Multi-provider script:** one program that answers the same question via **OpenAI** and **Gemini** (both through the OpenAI client), then via **LiteLLM**. Print all three.
- **Structured output:** define a Pydantic `Book {title, author, year}` and get an LLM to fill it from a free-text description; validate it.
- **Failure write-up:** pick one incident from §8, write 4–5 lines: what happened + how you'd prevent it.
- **Read-ahead:** zero-shot vs few-shot prompting (Day 2).

---

## 🔗 Resources (verify on teaching day)
- Tokenizer (live) — https://platform.openai.com/tokenizer
- OpenAI docs — https://platform.openai.com/docs · Gemini OpenAI-compat — https://ai.google.dev/gemini-api/docs/openai · Anthropic — https://docs.anthropic.com
- LiteLLM — https://docs.litellm.ai · Pydantic — https://docs.pydantic.dev
- Prompt guide — https://www.promptingguide.ai
- Failure cases: [Air Canada](https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-february/bc-tribunal-confirms-companies-remain-liable-information-provided-ai-chatbot/) · [Gemini images](https://www.axios.com/2024/02/23/google-gemini-images-stereotypes-controversy) · [Chevy $1](https://venturebeat.com/ai/a-chevy-for-1-car-dealer-chatbots-show-perils-of-ai-for-customer-service) · [DPD](https://time.com/6564726/ai-chatbot-dpd-curses-criticizes-company/) · [Fable](https://lithub.com/fables-ai-generated-end-of-year-reading-summaries-veered-into-bigotry/) · [nullifAI/Hugging Face](https://thehackernews.com/2025/02/malicious-ml-models-found-on-hugging.html)

---
Pairs with → [Day 1 · Backend](Day_01_Backend.md)
