# Day 2 · AI — Advanced Prompting, Structured Outputs & Tools

**Date:** ______ · **Block:** Generative AI · **Pairs with:** [Course Tracker](../Course_Tracker.md) · **Previous:** [Day 1 · AI](Day_01_AI.md)

> **Trainer context:** Day 1 got a model to **answer**. Today we make it answer **reliably** (advanced prompting), in a **shape our code can trust** (structured outputs), and let it **do things** (function calling / tools). This is the exact machinery behind RAG (Day 4) and Agents (Day 5) — today builds the skeleton.

> ⏱️ **How to use this file:** it's bigger than one sitting on purpose. Sections are tagged **`[Core]`** (teach live) or **`[Extended]`** (demo if time, else assign as reading/homework). If you run short, trim Extended first — but **protect §4 (function calling)**; it's the new, high-value skill everything after Day 2 leans on.

## 🎯 Objectives
By end of day a student can:
- Set the common **call parameters** — temperature, `max_tokens`, `top_p`, and the penalties.
- Use **few-shot examples** to teach a model a new task at runtime (in-context learning) — and say when it beats plain instructions.
- Trigger **chain-of-thought** reasoning, and explain **reasoning models** and when *not* to force step-by-step.
- **Validate data with Pydantic** (vs a `TypedDict`) and get a **schema-guaranteed** structured output with `parse()`.
- Wire up **function calling**: define a tool, run the tool-call loop **step by step**, and let the model use real data.
- Route between **multiple tools** safely, and see why this loop is the skeleton of an **agent**.

---

## 🔁 Kickoff — recap + hook — 8 min  `[Core]`
**30-second recap of Day 1:** LLM = next-token predictor · we call it with the OpenAI client (same client reaches Gemini) · LiteLLM swaps providers by a model string · a good prompt = **Role + Task + Context + Format** · it **hallucinates**, so verify.

❓ **Ask the class (one open question):** *"Your Day-1 support bot gets this message: **'What's the status of order A123, and refund me if it's late.'** What does the LLM need that it simply does not have?"*
Let answers surface, then name the three gaps — **they are today's three sections':**
- It has **no live data** — it can't see order A123 → **tools / function calling** (§4–5).
- Your code needs a **guaranteed shape** to act on (status, is_late, amount) → **structured outputs** (§3).
- It must **reason** ("is 3 days late enough?") reliably → **advanced prompting** (§1–2).

💡 **AHA:** *"Yesterday the model talked. Today it acts — on real data, in a shape you can trust."*

---

## ⚙️ LLM call parameters — the knobs — 12 min  `[Core]`

You already met **temperature** (Day 1). A few more knobs shape every `create(...)` call; cover them here so Day 3 can stay on the advanced material.

| Knob | What it does | Typical use |
| ----- | ----- | ----- |
| **`temperature`** | randomness (0 = focused/repeatable, high = creative) | 0 for extraction/classification, 0.7+ for ideas |
| **`top_p`** | nucleus sampling — another randomness dial | tune **temperature *or* top_p**, not both |
| **`max_tokens`** | caps the **reply length** | keep answers short / control cost |
| **`frequency_penalty`** | less repetition of the **same words** (−2…2) | fix "it keeps repeating" |
| **`presence_penalty`** | pushes toward **new topics** (−2…2) | more varied coverage |
| **`top_k`** | keep only the top-*k* tokens | ⚠️ **not on OpenAI** — Gemini/Claude only |

💡 **AHA — max_tokens live:** set `max_tokens=20`, ask for a long explanation → it stops mid-sentence and `finish_reason == "length"`. *"The cap is on output length, not quality."*
💡 **frequency vs presence:** `frequency_penalty` stops the model **repeating the same word**; `presence_penalty` nudges it to a **new topic** — the notebook shows each alone (a pizza paragraph vs a party-ideas brainstorm).
🧑‍🏫 **Trainer note:** newer/reasoning models rename `max_tokens` → **`max_completion_tokens`** (same idea). **`top_k`** isn't an OpenAI param (it errors) — the notebook demos it via **LiteLLM** on **Gemini**; it's also on Claude. Other knobs worth naming: `stop` (stop sequences) and `seed` (more reproducible output).
❓ **Ask:** *"You want the same answer every time for a test. Which knob helps most?"* → *temperature 0 (and `seed`).*

---

## 1️⃣ Zero-shot → few-shot: teaching by example — 22 min  `[Core]`

**Zero-shot** = you give **instructions only**, no examples. That's every prompt from Day 1.
**Few-shot** = you put a **handful of worked examples** (input → output) right in the prompt, and let the model infer the pattern. One example = *one-shot*.

This is called **in-context learning**: the model "learns" the task from the prompt itself — **no retraining, no fine-tuning, no code change.**

💡 **AHA:** *"You can teach the model a brand-new task in the prompt, at runtime, just by showing 2–3 examples. That's the cheapest 'training' there is."*

**Concrete example — a custom classifier.** Say support tickets must be labeled **`urgent` / `normal` / `spam`** (your taxonomy, not the model's).
- ❌ **Zero-shot:** `Classify this ticket: "the app crashes every time I open it"` → it might say "Technical issue" or "high priority" — *not your three labels.*
- ✅ **Few-shot:** show the pattern first:
```text
Ticket: "URGENT!! payment taken twice, need money back now"  -> urgent
Ticket: "how do I change my profile photo?"                  -> normal
Ticket: "You WON a free iPhone, click here"                  -> spam
Ticket: "the app crashes every time I open it"               ->
```
→ the model completes `urgent`, in **exactly your label set**. Same model, no code — the **examples** did the teaching.

**When few-shot earns its tokens:**
- Enforcing a **specific output format or style** ("PRODUCT | PRICE", a fixed JSON shape, a tone of voice).
- **Classification with your own labels** / categories.
- Tasks that are **hard to describe but easy to demonstrate** (edge cases, a house style).

**How many shots?** Usually **2–5** is plenty; returns diminish fast and every example costs tokens on **every** call. Start at 3.

⚠️ **Pitfalls (say these out loud):**
- **Imbalanced examples bias the model** — if all 3 examples are `spam`, it over-predicts `spam`. Balance the labels.
- **Order can sway it** — vary/representatively order your examples; don't put all of one class together.
- **Format drift** — the examples' format IS the spec. Keep it identical to what you want back.

🧑‍🏫 **Trainer note:** frame few-shot as *"show, don't tell."* Reach for it **before** you ever think about fine-tuning — 3 examples in the prompt beat a week of training for most format/label problems.
❓ **Ask:** *"You need the bot to reply in your company's exact tone. Fine-tune a model… or?"* → *paste 2–3 example replies (few-shot).*

---

## 2️⃣ Chain-of-thought & reasoning — 22 min  `[Core]`

Ask a model a multi-step question and demand the answer immediately → it often **blurts a wrong guess**. Give it room to **work through the steps** → it gets it right. That "room to think" is **chain-of-thought (CoT)**.

**Zero-shot CoT** — the magic words: add **"Let's think step by step"** (or *"show your working, then give the final answer"*).
**Few-shot CoT** — combine with §1: your examples themselves show the *reasoning*, not just the answer.

💡 **AHA — live:** ask *"A shop had 23 apples, sold 17, got a delivery of 40, then sold half. How many now?"*
- Answer-only → frequently wrong.
- Add *"think step by step"* → it lays out 23−17=6, +40=46, ÷2=23 → **right**.
> The reasoning tokens are the model *doing the work on paper* instead of guessing the last line.

**Self-consistency** `[Extended]` — for high-stakes reasoning, ask the same question a few times (higher temperature), get several independent chains, and **take the majority answer.** Costs more calls, buys reliability.

**Prompt chaining / decomposition** `[Extended]` — break one hard prompt into a **sequence**: first *extract the facts*, then *answer from those facts*. Smaller steps = fewer mistakes and easier to debug.

**Reasoning models (2026)** — the big shift. Newer models (**OpenAI GPT-5 "thinking" / o-series, Gemini "thinking", Claude extended thinking**) **reason internally before answering** — CoT is baked into the model. You steer it with a **reasoning-effort / thinking-budget** knob (low/medium/high) instead of prompt tricks.
- 💡 **AHA:** *"A reasoning model is just chain-of-thought built into the model and (often) hidden from you."*
- 🧑‍🏫 On these, **don't** paste "think step by step" — they already do it; over-instructing can *hurt*. Give the goal and constraints; raise effort for hard problems.

⚠️ **When NOT to reason:** simple lookups, formatting, or extraction — CoT just burns **tokens + latency**. And a long reasoning chain on a **real-time-fact** question doesn't find truth, it produces a *more elaborate hallucination* (Day 1 lesson → that's what **RAG** fixes, Day 4).

🧑‍🏫 **Trainer note:** CoT is a **cost/accuracy trade**. Use it where correctness matters (math, logic, planning, multi-constraint decisions); skip it for trivial tasks. ⚠️ *Verify exact model IDs on the day — they change monthly.*

---

## 3️⃣ Structured outputs, properly — 22 min  `[Core]`

**Recap Day 1:** we asked for **JSON** and validated with **Pydantic** (`model_validate_json`). That works — but "please return JSON" only makes the text *look* like JSON. The model can still **drop a field, add an extra one, or use the wrong type** → your `validate` throws → you retry. **Hope, not a guarantee.**

**The upgrade — Structured Outputs.** The API can **constrain the model's generation to exactly your schema.** Hand it a **Pydantic model** as `response_format` and call **`parse()`** — you get a **typed object** straight back. The shape is *guaranteed*.

```python
from pydantic import BaseModel

class Recipe(BaseModel):
    title: str
    ingredients: list[str]
    minutes: int

completion = client.chat.completions.parse(   # ← .parse(), not .create()
    model="gpt-5.6",                           # ⚠️ verify id; also works on gpt-4o-mini
    messages=[{"role": "user", "content": "A simple pasta recipe."}],
    response_format=Recipe,                     # ← pass the class itself
)
recipe = completion.choices[0].message.parsed  # ← a real Recipe object, already typed
print(recipe.title, "—", recipe.minutes, "min")
```

💡 **AHA:** *"'Ask for JSON' = hope. 'Structured Outputs' = guarantee — the model literally can't emit a shape that breaks your schema. No parsing, no regex, no retry loop."*

**Pydantic is doing the checking.** A Pydantic model isn't just a shape — it **validates at runtime**: give a field a type (and optional `Field(...)` rules) and bad data is *rejected* with a clear `ValidationError`. That's the difference from a **`TypedDict`**, which is only an editor hint and never checks at runtime (`age="ten"` slips through silently). `parse()` leans on exactly this to hand you a trusted object.

**Constrain the categories with an `Enum`** — this is §1's classifier, now *enforced*:
```python
from enum import Enum
from pydantic import BaseModel

class Priority(str, Enum):
    urgent = "urgent"; normal = "normal"; spam = "spam"

class Ticket(BaseModel):
    customer: str
    priority: Priority          # model can ONLY pick one of the three
    summary: str
```
The model **cannot** invent a fourth label — the type system won't let it.

**Why this matters:** the model's messy text becomes the **contract** between AI and your backend. `ticket.priority` is safe to write straight into a database or an `if` — that's how GenAI plugs into a real system.

🧑‍🏫 **Trainer note:** the dict form `response_format={"type": "json_schema", "json_schema": {...}}` does the same without Pydantic (for other languages) — mention, don't dwell. Same idea works through the OpenAI client on **Gemini** and via **LiteLLM**.
❓ **Ask:** *"Your app writes the model's answer straight into a Postgres row. What must be true about that answer, every single time?"* → *exact fields + exact types → Structured Outputs.*
⚠️ Structured Outputs supports a **subset** of JSON Schema — keep schemas reasonable (avoid exotic constraints).

---

## 4️⃣ Function calling / tool use — 30 min  `[Core]`  ← the centerpiece

**The problem.** An LLM only predicts **text**. It can't do exact arithmetic, read **your** database, hit an API, check **live** weather, or send an email. And from Day 1: instead of admitting it can't, it will **confidently guess** (hallucinate).

**The idea.** You hand the model a **menu of tools** (functions) it's allowed to use, each described as a JSON schema. When the model decides it needs one, it **doesn't run it** — it **asks you to**, by returning a structured **`tool_call`** (function name + arguments). **Your code runs the function**, hands the result back, and the model turns that into a final answer.

💡 **AHA:** *"The model never runs your code. It just says 'please call `calculator(a=47853, b=1942, op="mul")`.' **You** execute it. That boundary is the whole safety story — the model can request, only your code can act."*

**The loop — draw this on the board:**
```
1. You  → model:  messages + tools=[...]
2. model → you:   tool_call  (name + JSON args)      ← not a normal answer
3. You  → run the function, append the result as a  role:"tool"  message
4. You  → model:  call again  →  model writes the final natural-language answer
```

**Worked example — a calculator tool** (the model can't do exact math, so it delegates). Build it in **5 small steps** — teach one cell at a time; a wall of code loses the room.

**Step 1 — a normal Python function** (no AI yet):
```python
def calculator(a: float, b: float, op: str) -> dict:
    result = {"add": a + b, "sub": a - b, "mul": a * b,
              "div": a / b if b else None}[op]
    return {"result": result}
```

**Step 2 — describe it to the model** (this schema is the model's entire knowledge of it):
```python
tools = [{
    "type": "function",
    "function": {
        "name": "calculator",
        "description": "Do exact arithmetic on two numbers.",
        "parameters": {
            "type": "object",
            "properties": {
                "a":  {"type": "number"},
                "b":  {"type": "number"},
                "op": {"type": "string", "enum": ["add", "sub", "mul", "div"]},
            },
            "required": ["a", "b", "op"],
            "additionalProperties": False,
        },
    },
}]
```

**Step 3 — ask; the model *requests* the tool** (not a normal answer):
```python
import json
messages = [{"role": "user", "content": "What is 47853 times 1942?"}]
resp = client.chat.completions.create(model="gpt-5.6", messages=messages, tools=tools)
msg = resp.choices[0].message
call = msg.tool_calls[0]          # real code guards this first:  if msg.tool_calls: ...
print(call.function.name, call.function.arguments)   # calculator {"a":47853,"b":1942,"op":"mul"}
```

**Step 4 — run the function** with the model's arguments:
```python
args = json.loads(call.function.arguments)   # {"a": 47853, "b": 1942, "op": "mul"}
result = calculator(**args)                   # {"result": 92930526}
```

**Step 5 — feed the result back → final answer:**
```python
messages.append(msg)                          # the model's tool request
messages.append({                             # your tool's result
    "role": "tool",
    "tool_call_id": call.id,
    "content": json.dumps(result),
})
final = client.chat.completions.create(model="gpt-5.6", messages=messages, tools=tools)
print(final.choices[0].message.content)
# → "47,853 × 1,942 = 92,930,526."
```

💡 **AHA:** *"This is how ChatGPT browses the web, runs code, and checks the weather. It's tools all the way down."*
🧑‍🏫 **Trainer note:** the tool's **`description`** (and each parameter's description) **is prompt engineering** — the model picks tools *from those words*. Vague description → wrong or missed tool. Good tool docs = good tool use.

---

## 5️⃣ Multiple tools, routing & safety — 18 min  `[Core]` / `[Extended]`

Give the model **several** tools and it **routes** to the right one from the question — a *router* for free:
```python
tools = [calculator_tool, get_weather_tool]   # model picks the one that fits per question
```
Ask *"what's 12 × 9?"* → it calls `calculator`; ask *"weather in Delhi?"* → it calls `get_weather`. Same loop as §4, just more tools on the menu.

**Parallel tool calls** `[Extended]` — one turn can return **several** `tool_calls` at once (e.g., weather in *two* cities). Run them all, append **one `role:"tool"` message per call** (match each `tool_call_id`), then call again.

🔒 **Safety — this is Day 1's injection lesson, made real.** Tool arguments come from a model steered by **user text** → treat them as **untrusted**:
- **Validate / whitelist** every argument before executing (never `eval()` a "calculator"; never run raw SQL built from args; clamp numbers to sane ranges).
- **Scope each tool's power** — read-only where possible.
- Anything **costly or irreversible** (refund, delete, email, payment) → **hard limits + a human in the loop**.

💡 **AHA:** *"Tools are the model's hands. The more you let its hands grab, the harder you must check what they're grabbing."*
❓ **Ask:** *"Your agent has a `send_refund(amount)` tool. What are the two lines you must never skip?"* → *validate/cap the amount + require human approval.*

---

## 6️⃣ Put it together — the agent skeleton — 12 min  `[Core]`

Watch the three pillars snap into **one flow**:
```
user message
  → a good/few-shot prompt frames the task        (§1–2)
  → the model calls a TOOL to fetch real data      (§4–5)
  → returns a STRUCTURED object your code stores    (§3)
  → done — and you never trusted a raw string
```

💡 **AHA:** *"This loop — **think → call a tool → observe the result → think again**, repeated until the task is done — **is an agent.** You built the skeleton today. Day 5 adds memory, planning, and many steps."*

**Where this goes next:**
- **RAG (Day 4)** — the tool becomes *"search my documents,"* so the model answers from **your** data instead of hallucinating. Today's tool-calling is the *mechanism*; RAG is its most valuable use.
- **Agents (Day 5)** — this loop + memory + planning + multiple tools.
- **Real world today:** support automation, coding assistants (read/run tools), data-extraction pipelines, "chat with your systems."

---

## 🧪 In-class exercises  `[Core]`
✏️ **Micro (pairs, 5 min):** take a **zero-shot** classifier prompt and make it **few-shot** with 3 labeled examples (`urgent/normal/spam`); run both on the same new ticket and compare.
🧪 **Main (20 min):**
1. **Few-shot:** build a 3-example prompt that labels a support ticket `urgent/normal/spam`; test on **two** new tickets.
2. **Structured output:** define a Pydantic `Ticket` with an **`Enum`** priority; get a typed `.parsed` back with `client.chat.completions.parse`.
3. **Function calling:** give the model a `calculator` tool and run the **full 5-step loop** so it answers *"what's 47853 × 1942?"* using your function's result.
4. **Stretch:** add a **second** tool (a simple `get_weather(city)` lookup) and ask a question that makes the model **route** to the right one.

---

## 📝 Revision & Quiz — 8 min  `[Core]`
**Say it back:** few-shot = teach by example in the prompt (in-context learning) · CoT = "think step by step" for multi-step accuracy · reasoning models think internally (don't hand-roll CoT) · Structured Outputs = *guaranteed* schema via `parse()` · function calling = the model **requests**, your code **runs** · validate tool args · think→act→observe = an agent.

Quiz (*answers for me in italics*):
1. Zero-shot vs few-shot? *Instructions only vs a few input→output examples in the prompt (in-context learning).*
2. When does few-shot help most? *Custom labels/format/tone; tasks easier to show than to describe.*
3. What does "think step by step" improve, and at what cost? *Multi-step reasoning accuracy; more tokens + latency.*
4. Why not paste "think step by step" into a reasoning model? *It already reasons internally; over-instructing can hurt.*
5. "Ask for JSON" vs Structured Outputs? *Looks-like-JSON (hope) vs guaranteed to match your exact schema.*
6. Which call returns a typed object directly, and how do you read it? *`client.chat.completions.parse(..., response_format=Model)` → `.choices[0].message.parsed`.*
7. In function calling, who actually runs the function? *You / your code — the model only requests the call.*
8. The four steps of the tool loop? *Send tools → model returns a tool_call → you execute + append the result → call again for the final answer.*
9. With two tools on the menu, how does the model pick? *It reads the question and routes to the tool whose description fits.*
10. Why must you validate tool arguments? *They're untrusted (prompt-injection risk) — Day 1's lesson.*
11. Why does a tool's `description` matter? *The model chooses tools from their descriptions — it's prompt engineering.*
12. The think→act→observe loop is the skeleton of a…? *An agent (Day 5).*

---

## 🏠 Homework
- **Few-shot classifier:** write a 3-example `urgent/normal/spam` prompt, test on **5** new tickets, note **one** misclassification, then **add an example** that fixes it. (Show before/after.)
- **Structured extraction:** define a **nested** Pydantic model with an `Enum` (e.g., `Ticket` containing a `Customer`), and fill it from a messy paragraph using `parse`.
- **Two-tool assistant:** wire a `calculator` **+** a simple `get_weather(city)` lookup; ask one question that needs each; print the `tool_calls` the model chose.
- **Read-ahead:** *What is an embedding?* (Day 3 — turning text into vectors.)

---

## 🔗 Resources (verify on teaching day)
- Function calling — https://platform.openai.com/docs/guides/function-calling · Cookbook — https://cookbook.openai.com
- Structured Outputs — https://platform.openai.com/docs/guides/structured-outputs
- Prompting (few-shot, CoT) — https://www.promptingguide.ai/techniques/fewshot · https://www.promptingguide.ai/techniques/cot
- Self-consistency — https://www.promptingguide.ai/techniques/consistency
- Gemini OpenAI-compat (tools + JSON) — https://ai.google.dev/gemini-api/docs/openai · LiteLLM — https://docs.litellm.ai
- Pydantic — https://docs.pydantic.dev

---
Previous → [Day 1 · AI](Day_01_AI.md) · Next → Day 3 (Embeddings & Vector Search)
