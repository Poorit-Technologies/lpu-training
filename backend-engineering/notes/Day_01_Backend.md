# Day 1 · Backend — Python OOP + Your First FastAPI

**Date:** ______ · **Block:** Backend · **Suggested time:** ~90 min · **Pairs with:** [Day 1 · AI](Day_01_AI.md) · **Tracker:** [../Course_Tracker.md](../Course_Tracker.md)

> **Trainer context:** Students already have basic Python, so syntax is a quick *refresher, not a lecture*. Spend today's minutes where they pay off: **OOP** (the backbone of every backend) and a **real running FastAPI**. Win condition: every student leaves with a live API and `/docs` open on their screen.

## 🎯 Objectives
- Move past basic syntax fast; **model real things with classes** (OOP).
- Explain the 4 OOP pillars in *backend* terms.
- Build & run a **FastAPI** app with path params, query params, and a **Pydantic** request body.
- Feel FastAPI's **auto-docs + auto-validation** aha.

## 🔁 Kickoff — 5 min
> *Day 1 special. **From Day 2 this slot becomes a 10-min recap + quiz on the previous day.***
- Put the [tracker](../Course_Tracker.md) on screen: "10 days → real backend + AI apps → a capstone for your resume."
- ❓ **Ask the class:** *"In your AI project, where did the data live while the model ran? Where would it live if 1,000 users hit your app at once?"* → that's what a **backend** manages.

## 1️⃣ Python: 5-minute confirm (don't teach) — 5 min
Show, don't lecture — just confirm recall:
```python
nums = [90, 85, 77]
avg = sum(nums) / len(nums)                 # numbers, lists
squares = [n * n for n in nums]             # comprehension
student = {"name": "Ada", "branch": "CSE"}  # dict
def greet(name: str) -> str:                # function + type hints
    return f"Hi {name}"
```
⚠️ **Only gotchas worth flagging:** mutable default arguments, and `/` always returns a float. Mention, move on.
🧑‍🏫 **Practical tip:** ask *"who's rusty on any of this?"* — if >30% raise a hand, give 5 more min; otherwise go straight to OOP. Don't let confident students get bored on syntax.

## 2️⃣ OOP — the heart of backend — 35 min  ← spend the most time here

### Why OOP?
A backend is full of **things**: users, students, orders, payments. OOP lets each thing be an **object** carrying its **data + behavior** together.

💡 **AHA MOMENT** — put this up and ask *"what's the relationship here?"*
```python
class Student:
    def __init__(self, id: int, name: str, branch: str = "CSE"):
        self.id = id
        self.name = name
        self.branch = branch

    def label(self) -> str:
        return f"[{self.id}] {self.name} ({self.branch})"

ada = Student(1, "Ada")
raj = Student(2, "Raj", "ECE")
print(ada.label())   # [1] Ada (CSE)
```
> **One class (blueprint) → infinite objects (instances).** `ada` and `raj` share *behavior*, not *data*. That click is the aha.

### The 4 pillars — in backend language
| Pillar | Plain meaning | Backend example |
| ----- | ----- | ----- |
| **Encapsulation** | bundle data + methods, hide internals | `BankAccount.deposit()` guards `balance` |
| **Inheritance** | reuse via parent → child | `Admin(User)`, `Student(User)` |
| **Polymorphism** | same method, different behavior | `notify()` → email vs SMS |
| **Abstraction** | expose *what*, hide *how* | `db.save(user)` hides the SQL |

Encapsulation, live:
```python
class BankAccount:
    def __init__(self):
        self.__balance = 0                     # "private" (name-mangled)
    def deposit(self, amount: int):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.__balance += amount
    def balance(self) -> int:
        return self.__balance
```
❓ **Ask the class:** *"Why not just let anyone do `account.balance = -500`?"* → leads straight to **validation & invariants**, a core backend job.

### Modern Python: `@dataclass` (the 2026 way)
```python
from dataclasses import dataclass

@dataclass
class Student:
    id: int
    name: str
    branch: str = "CSE"
```
> Same class as before, zero boilerplate.

🧑‍🏫 **Practical tip:** call dataclasses "the bridge to Pydantic" — in 15 minutes they'll write an almost-identical `BaseModel` for FastAPI and realize they already know the shape.

✏️ **Quick exercise (3 min, in pairs):** Write a `Book` class with `id, title, author` and a method `citation()` → `"title — author"`. Make 2 books, print both citations. *(Fastest pair explains theirs.)*

## 3️⃣ Environment with uv — 5 min
```bash
uv init student-api && cd student-api
uv add "fastapi[standard]"
```
🆕 **Latest (2026):** `uv` (Astral) is the fast all-in-one tool — venv + install + Python version in one, 10–100× faster than pip. Python **3.14** is the current stable line. `uv` auto-creates the venv, so **no `activate` step**.
🧑‍🏫 **Practical tip:** make *everyone* run these two commands now and show a green install before you continue. A stuck install here quietly derails the whole session — catch it early.

## 4️⃣ FastAPI — build a real API — 35 min

### First endpoint (live)
```python
# main.py
from fastapi import FastAPI

app = FastAPI(title="Student API")

@app.get("/")
def home():
    return {"message": "Backend is live 🎉"}
```
```bash
uv run fastapi dev main.py      # serves at http://127.0.0.1:8000
```
💡 **AHA #1 — free interactive docs:** open **`/docs`**. *"You wrote 4 lines. FastAPI handed you a full, testable API console."* Let them click **Try it out**.

### Path & query params (typed = validated)
```python
@app.get("/students/{student_id}")
def get_student(student_id: int):
    return {"id": student_id, "name": "Ada"}

@app.get("/students")
def list_students(branch: str | None = None, limit: int = 10):
    return {"branch": branch, "limit": limit}
```
💡 **AHA #2 — validation for free:** open `/students/abc`. It returns a clean **422 error** — *you wrote zero validation code*. The `int` hint did it.
❓ **Ask the class:** *"Where in your AI app would auto-validation have saved you from a crash?"*

### POST + Pydantic model (the big one)
```python
from pydantic import BaseModel

class StudentIn(BaseModel):
    name: str
    branch: str = "CSE"
    age: int

@app.post("/students")
def create_student(s: StudentIn):
    return {"created": s, "label": f"{s.name} ({s.branch})"}
```
💡 **AHA #3 — Pydantic magic:** in `/docs`, POST with `age: "hello"` → instant, precise validation error. *"Your dataclass instinct + FastAPI = a self-documenting, self-validating API."*
🧑‍🏫 **Practical tip:** `def` vs `async def` — say async exists (for DB/LLM calls later) and move on. Don't rabbit-hole on it today.

## 🧪 In-class exercise — 15 min (individual, then compare)
Extend `main.py`:
1. `GET /health` → `{"status": "ok"}`.
2. Store students as a **list of `Student` objects**; make `GET /students` return them.
3. `GET /students/{id}` returns one, or a not-found message.
4. `POST /students` appends a new `StudentIn` and returns it.
5. Test **everything from `/docs`**, not the URL bar.

✅ **Checkpoint:** every student has ≥4 working endpoints, tested via `/docs`. Walk the room. Usual blockers: server not restarted, indentation, wrong port.

## 📝 Revision & Quiz — 8 min
**Say it back:** class = blueprint, object = instance · 4 pillars · type hints → validation · `/docs` is free · Pydantic `BaseModel` = validated request body.

Quiz (*answers for me in italics*):
1. Class vs object? *Blueprint vs instance.*
2. What does `self` refer to? *The current object.*
3. Which pillar hides internal data? *Encapsulation.*
4. What produced the 422 on `/students/abc`? *The `int` type hint (Pydantic).*
5. Base class for a request body? *`pydantic.BaseModel`.*
6. Command to run the dev server? *`uv run fastapi dev main.py`.*
7. Where do you test endpoints interactively? *`/docs`.*

## 🏠 Homework
- Upgrade today's app into a **Student Record API**: full CRUD — `GET` all/one, `POST`, and `DELETE /students/{id}` — over an in-memory list of `Student` objects. *(Day 8 → real database.)*
- Model a `Course` class and a `Student` who **has many** courses (a list). Print a student with their courses. *(Sets up DB relationships on Day 8.)*

## 🔗 Resources (verify on teaching day)
- FastAPI tutorial — https://fastapi.tiangolo.com/tutorial/
- Pydantic — https://docs.pydantic.dev
- uv — https://docs.astral.sh/uv
- Python dataclasses — https://docs.python.org/3/library/dataclasses.html

---
Pairs with → [Day 1 · AI](Day_01_AI.md)
