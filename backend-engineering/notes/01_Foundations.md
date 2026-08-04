# Backend Foundations — Python & OOP · FastAPI · Pydantic

**Module 1 of 3 · Backend · 3 hours live** · runs locally in VS Code
**Code:** [`code/01_foundations/`](../code/01_foundations/) · **Setup:** [SETUP.md](../SETUP.md)

> **Trainer context:** three things get taught today, in this order — **Python & OOP**, **FastAPI**, **Pydantic**. They stack: OOP teaches the shape of a class, FastAPI gives that class a job, Pydantic makes it enforce itself.
> **Win condition:** every student ends with their own server running and `/docs` open on their screen.

**How to read the markers:**

| | Meaning |
| --- | --- |
| 🟢 | **Teach live.** This is the 3-hour path. |
| 🔵 | **Demo if time** — ~5 min, run the file, talk over it. Skip without guilt; it's written up in full below. |
| 📖 | **Read at home.** Named in class in one sentence, no more. |
| 🖥️ | A file *you* run on the projector. |
| ✏️ | A task *they* do. Blank file, no starter code. |

## ⏱️ The live 3-hour path

| Time | Section | |
| --- | --- | --- |
| 0–10 | Hook + what the three modules build | 🟢 |
| 10–18 | Setup check · what pip, venv and uv each do | 🟢 |
| 18–30 | **A.** Python refresher · type hints · errors · JSON | 🟢 |
| 30–60 | **B.** OOP core — classes, `self`, the 4 pillars, `super()` | 🟢 |
| 60–72 | **B.** dunders · `@property` · composition · `@dataclass` | 🟢 |
| 72–77 | ✏️ Exercise set 1 | 🟢 |
| 77–90 | **D.** What FastAPI is · first app · `/docs` · HTTP methods | 🟢 |
| 90–103 | **D.** Path & query params · `Path()` / `Query()` rules | 🟢 |
| 103–115 | **D.** Request body · status codes · `response_model` · `HTTPException` | 🟢 |
| 115–122 | **D.** `async def` vs `def` | 🟢 |
| 122–130 | ✏️ Exercise set 2 | 🟢 |
| 130–145 | **E.** Pydantic — `Field()` rules, validators, reading a `ValidationError` | 🟢 |
| 145–152 | **E.** Ready-made types · nested models · `ConfigDict` | 🔵 |
| 152–160 | **C/D.** Project structure + `APIRouter` | 🔵 |
| 160–172 | 🧪 Main build | 🟢 |
| 172–180 | Recap + quiz | 🟢 |

🧑‍🏫 **If you are running ahead**, add the 🔵 demos in this order — each is ~5 minutes and each is a genuine "oh, that's clever" moment: **`Depends`** → **middleware** → **background tasks**. If you are running behind, cut §D12–D14 and §E4 first; they're written up in full for students to read.

> 🔴 **`Depends` (§D12) is on the critical path now.** In the 3-module backend it carries the **database session** (Module 2) and **`get_current_user`** (Module 3). Cutting it here is still fine — **Module 2 re-teaches it cold** before SQLAlchemy — but if you have the five minutes, spending them here makes both later modules faster.

## 🎯 Objectives
By the end a student can:
- Read and write Python with **type hints**, and say why hints matter here.
- Explain **class vs object**, the **4 pillars**, and choose **composition over inheritance** when it fits.
- Explain what **pip**, **venv** and **uv** each do, and set up a project with uv.
- Build a FastAPI app with **path params, query params, a request body, status codes and errors**.
- Write **Pydantic models with real validation rules**, including custom ones.
- Test everything from **`/docs`**.

---

## 🪝 Hook · 10 min

Put this up and let them argue:

> **"Every program you have written so far runs on *your* laptop. Close the lid. Who else can use it?"**

Let three or four answers land. They'll say "host it", "make a website", "put it online". Then land it:

- A script runs, prints, and dies. Nobody else was ever involved.
- A **backend** is a program that **stays running**, **waits**, and **answers** — your app, a website, another company's software, a thousand people at once.
- Everything they use daily is one. Tapping **like** sends a request to a backend; it decides, stores, and answers.

❓ **Ask the class:** *"When you tap 'like' — what exactly travels to the server, and what comes back?"*
→ Steer to: **a small message goes out, a small message comes back.** That's an API. Not a screen, not a page.

**Then the map** — one minute, no detail:

| Module | What we build |
| --- | --- |
| **1 — today** | **Backend Foundations** — Python & OOP · FastAPI · Pydantic |
| **2** | **APIs & Databases** — REST design · full CRUD · error handling · `Depends` & `APIRouter` · SQL · PostgreSQL · SQLAlchemy · relationships |
| **3** | **Auth, Docker & Deploy** — hashing & JWT · RBAC · security · Redis caching · Docker · live deployment · an AI endpoint |

> One app, grown over three sessions. Say it: *"Today's app is small on purpose — you're going to live with it for a while."*

---

## 0️⃣ Setup — and what these tools actually are · 8 min 🟢

⚠️ **Do this now, not later.** A broken install discovered in hour two costs you the hour.

```bash
uv --version
```
Missing? ([SETUP.md](../SETUP.md) has the Windows line.)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
Then, from inside `code/`:
```bash
uv sync
uv run python -c "import fastapi; print('FastAPI', fastapi.__version__)"
```
**Walk the room until every screen prints a version.**

🧑‍🏫 **Trainer note — start this download, then leave it.** `uv sync` pulls a lot. Kick it off, then
send everyone to [the notebook](../notebooks/01_Python_Refresher.ipynb) in Colab and teach Parts A–C
while it finishes in the background. The notebook needs **nothing installed and no keys**, so a
broken laptop can't block anyone from the Python half — and by the time you reach FastAPI, every
machine is ready. Come back to this cell and check the version before Part D.

### The four words, explained properly
Students nod at "package manager" without knowing what any of it means. Two minutes here saves confusion all week.

| Word | What it actually is |
| --- | --- |
| **Package** | Someone else's code you can install and import. FastAPI is a package. |
| **PyPI** | The public shelf all packages sit on — *pypi.org*. `install` downloads from there. |
| **pip** | The classic installer. `pip install fastapi` fetches it and puts it in your Python. |
| **venv** | A private box of packages *for one project*, so projects don't fight. |
| **uv** | 2026's replacement for all of the above, in one tool — and it installs Python itself too. |

**Why venv exists — the story that makes it stick:** Project A needs FastAPI 0.90. Project B needs 0.140. Install packages globally and the second install breaks the first. A venv gives each project its own copy, so they never meet.

**pip vs uv, side by side:**

| | pip + venv | uv |
| --- | --- | --- |
| Make the box | `python -m venv .venv` | automatic |
| Switch it on | `source .venv/bin/activate` | **no activate step** |
| Install | `pip install fastapi` | `uv add fastapi` |
| Record what's needed | `pip freeze > requirements.txt` | `pyproject.toml`, written for you |
| Exact versions locked | ✗ not really | ✓ `uv.lock` |
| Install Python itself | ✗ | ✓ `uv python install 3.14` |
| Speed | seconds to minutes | 10–100× faster |
| Run something | activate, then `python x.py` | `uv run python x.py` |

🆕 **Latest 2026:** **Python 3.14** is the current stable line. **uv** (from Astral) is the tool the ecosystem has moved to.

💡 **AHA — where did the packages go?** Have them look: nothing was installed globally. `uv sync` read `pyproject.toml` and built a `.venv` folder **inside the project**.

❓ **Ask the class:** *"`requirements.txt` says `fastapi`. Your teammate installs today, you installed in January. Same version?"*
→ No — and that's the bug that eats an evening. A **lock file** (`uv.lock`) pins the exact version, so everyone gets an identical setup.

🧑‍🏫 **Practical tip:** the number-one failure here is `uv: command not found` *after* a successful install. The terminal must be closed and reopened. Say it **before** it happens.

---

# PART A — The Python you actually need · 12 min 🟢

## A1 · Refresher 📓 [notebook §2–5](../notebooks/01_Python_Refresher.ipynb)

Show it, confirm it, move on. **Don't teach this.**

```python
marks = [90, 85, 77]                        # list  - ordered, changeable
point = (12, 5)                             # tuple - ordered, FIXED
student = {"name": "Ada", "branch": "CSE"}  # dict  - labelled data  <- the big one
branches = {"CSE", "ECE", "CSE"}            # set   - no duplicates
```

Point at the **dict** and say: *"Hold on to this. In two hours it travels across the internet as JSON, and it looks exactly the same."*

Also worth 30 seconds each: `.get()` never crashes on a missing key · default and keyword arguments · comprehensions (`[n*n for n in marks]`).

**Three gotchas:**
- `4 / 2` → `2.0`. Division **always** gives a float; `//` gives a whole number.
- `==` compares **contents**, `is` compares **identity**. Two equal lists are `==` but not `is`.
- **Mutable default arguments** — `def add(item, basket=[])` creates that list *once* and reuses it forever. Use `None` and build it inside.

🧑‍🏫 **Practical tip:** ask *"who's rusty on any of that?"* If more than a third raise a hand, give it five more minutes. Otherwise move — confident students switch off fast when you drill syntax they have.

## A2 · Type hints — the most important 5 minutes of Part A 📓 [notebook §6](../notebooks/01_Python_Refresher.ipynb)

```python
def double(n: int) -> int:
    return n * 2

print(double(5))       # 10
print(double("ab"))    # abab   <- no error. Python does NOT enforce hints.
```

So why bother? Three reasons, and the third is why this course cares:
1. Your editor autocompletes and warns you.
2. Other people read them as documentation.
3. **FastAPI reads them and turns them into real validation.**

The ones they'll use all week: `list[int]` · `dict[str, str]` · `str | None` ("a string, or nothing at all").

💡 **AHA — set up the payoff now.** Put this on screen and say *"in an hour you'll write this, and `abc` will be rejected automatically, because of one word: `int`."*
```python
@app.get("/students/{student_id}")
def get_student(student_id: int):
    ...
```

## A3 · Errors and JSON 📓 [notebook §7–8](../notebooks/01_Python_Refresher.ipynb)

```python
try:
    age = int("hello")
except ValueError:
    print("that was not a number")

def set_age(age: int) -> int:
    if age < 0:
        raise ValueError("age cannot be negative")   # refuse, clearly
    return age
```

> *"Check, then refuse clearly. That's a backend's whole day."* FastAPI has the API-shaped version of `raise` — `HTTPException` — coming in Part D.

**JSON** is a dict with different punctuation:
```python
json.dumps({"name": "Ada", "active": True})
# '{"name": "Ada", "active": true}'      <- True became true, quotes became double
```
❓ **Ask the class:** *"Spot two differences between the Python dict and the JSON."* → `True`→`true`, single→double quotes. It's a **text** format — every API on the internet speaks it.
💡 **AHA:** FastAPI does both conversions for you. **You just return a dict.**

---

# PART B — OOP · 42 min 🟢 ← the biggest block

## B1 · Classes and objects 📓 [notebook §9](../notebooks/01_Python_Refresher.ipynb)

**Why bother?** Show the alternative first — it's the fastest way to make the point:
```python
names    = ["Ada", "Raj"]
branches = ["CSE", "ECE"]
ages     = [20, 21]
```
❓ **Ask the class:** *"Raj has left the course. Delete him."*
→ Three deletes, in three lists, in the right order — or the data is silently wrong forever. **One student is one thing. It belongs in one place.**

```python
class Student:
    college = "LPU"                     # CLASS attribute - shared by everyone

    def __init__(self, id: int, name: str, branch: str = "CSE"):
        self.id = id                    # INSTANCE attributes - one copy per object
        self.name = name
        self.branch = branch

    def label(self) -> str:
        return f"[{self.id}] {self.name} ({self.branch})"
```

💡 **AHA — one blueprint, infinite objects.** `ada` and `raj` share **behaviour**, not **data**. Board: **class = the form, object = a filled-in copy of the form.**

**On `self`** — it's "the object this method was called on". Prove it rather than explaining it:
```python
ada.label()            # [1] Ada (CSE)
Student.label(ada)     # [1] Ada (CSE)   <- identical. self was ada all along.
```

**Instance vs class attributes** — run it live:
```python
ada.name = "Ada Lovelace"        # changes ONE object
Student.college = "LPU Jalandhar"  # changes it for EVERY object
```

❓ **Ask the class:** *"`Student` is a class. Is `ada` a class?"* → No — an **object**, an **instance**. Make them say "instance" out loud; it's the exam question they get wrong.

## B2 · The four pillars 📓 [notebook §10](../notebooks/01_Python_Refresher.ipynb)

| Pillar | Plain meaning | In a backend |
| --- | --- | --- |
| **Encapsulation** | keep data with the rules that guard it | `BankAccount.deposit()` refuses a negative amount |
| **Inheritance** | a child class reuses the parent | `Admin(User)` — same login, more power |
| **Polymorphism** | same method name, different behaviour | `notifier.send()` → email today, SMS tomorrow |
| **Abstraction** | show *what*, hide *how* | `db.save(student)` — the caller never sees SQL |

**Encapsulation:**
```python
class BankAccount:
    def __init__(self):
        self._balance = 0                              # _ means "internal, hands off"

    def deposit(self, amount: int):
        if amount <= 0:
            raise ValueError("amount must be positive")  # the rule lives HERE
        self._balance += amount
```
❓ **Ask the class:** *"Why not just let anyone write `account.balance = -500`?"*
→ Because the rule "money can't be negative" has to live **somewhere** — and if it isn't inside the class, it must be rewritten everywhere a balance is touched, and one of those places will forget. **A backend's entire job is to be the one place the rules are enforced.** This is the most important sentence of the module. Don't rush it.

🧑‍🏫 **Practical tip:** someone will notice `account._balance = -500` still works. Say so honestly: *"Python doesn't lock the door, it puts up a sign. `_name` means 'internal — you're on your own.' There's `__name` too, which mangles the name and makes it awkward to reach. Still not locked."* That honesty buys credibility for the rest of the day.

**Inheritance + `super()`:**
```python
class Admin(User):
    def __init__(self, name: str, level: int):
        super().__init__(name)      # run the parent's version first...
        self.level = level          # ...then add what's new

    def role(self) -> str:          # same name, different answer
        return "admin"
```
`Admin` never defines `describe()`, but `Admin("Raj", 2).describe()` works — it came from `User`, and it calls the **child's** `role()`. That's inheritance and polymorphism in one output line.

**Polymorphism, live:** in the file, change `notifier = EmailNotifier()` to `SMSNotifier()` and re-run. The calling line never changes.
💡 **AHA:** *"The code that sends the message doesn't know which one it got. Swap email for SMS in one line, and nothing else in a 50,000-line system is touched."*

## B3 · Dunders and `@property` 📓 [notebook §11](../notebooks/01_Python_Refresher.ipynb)

Start with the problem:
```python
print(Plain("Ada"))                    # <__main__.Plain object at 0x10080f830>
print(Plain("Ada") == Plain("Ada"))    # False
```
❓ **Ask the class:** *"Why is that `False`? They look identical."* → Because by default `==` asks *"are these the same object in memory?"*, not *"do they hold the same values?"*

Fix both with **dunder** ("double underscore") methods Python calls for you:

| Dunder | Python calls it when… |
| --- | --- |
| `__init__` | you create the object |
| `__str__` | you `print()` it |
| `__repr__` | it appears in a list, or in the debugger |
| `__eq__` | you use `==` |

💡 **AHA — this is what `@dataclass` writes.** After they see the three by hand, `@dataclass` stops being magic.

**`@property` — a method that behaves like an attribute:**
```python
@property
def area(self) -> float:
    return 3.14159 * self.radius ** 2

circle.area        # 12.56636   - no brackets. Looks like data, is code.
```
And with a setter, it's encapsulation done the Python way — a plain-looking assignment that still runs your rule:
```python
account.balance = 500     # goes through the setter
account.balance = -100    # ValueError: balance cannot be negative
```
❓ **Ask the class:** *"We wrote `deposit()` earlier for the same job. Why have both?"* → `deposit()` is a *verb* (an action, adds to the balance). `@property` makes something *look* like plain data while staying guarded. Use a property when callers think of it as a value.

## B4 · Composition vs inheritance, and ABCs 📓 [notebook §12](../notebooks/01_Python_Refresher.ipynb)

> **Inheritance is IS-A.** `Admin` **is a** `User`.
> **Composition is HAS-A.** `Student` **has** courses.

```python
class Student:
    def __init__(self, name: str):
        self.name = name
        self.courses: list[Course] = []      # HAS-A

    def enroll(self, course: Course):
        self.courses.append(course)
```
A `Student` is not a `Course`, so inheritance would be wrong. **Ask "is-a or has-a?" every time** — most real modelling is has-a.
📌 Say it: *"Remember this shape. A database calls it a **relationship**, and we build it in Module 2."*

**Abstract base class** — a contract children must honour:
```python
class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> str: ...
```
Forget to write `send()` and Python refuses to create the object at all:
```
TypeError: Can't instantiate abstract class BrokenNotifier without an implementation for abstract method 'send'
```
💡 **AHA:** that's abstraction with teeth — the error arrives at object creation, not at 2 a.m. when something calls `send()`.

## B5 · `@dataclass` 📓 [notebook §13](../notebooks/01_Python_Refresher.ipynb)

```python
@dataclass
class Student:
    id: int
    name: str
    branch: str = "CSE"
```
`__init__`, `__repr__` and `__eq__`, written for you. The file shows the by-hand version beside it so the saving is visible.

⚠️ **One trap worth showing** — a list inside a dataclass needs `field(default_factory=list)`, not `= []`. Same mutable-default bug as §A1, new costume.

🧑‍🏫 **Practical tip:** call this **"the bridge to Pydantic"** and say it twice. In an hour they write `class StudentIn(BaseModel)` and it looks almost identical — the reaction should be *"oh, I already know this shape."* That setup is worth more than another pillar example.

---

## ✏️ Exercise set 1 — OOP · 5 min

Blank file. No starter code.

1. **`Book`** — a class with `id`, `title`, `author` and a method `citation()` returning `"title — author"`. Make two books, print both citations.
2. **Convert it** to a `@dataclass`. Confirm the output is unchanged and that `print(book)` now shows the values.
3. **`Library`** — a class holding a list of `Book` objects, with `add(book)` and `count()`. *(Which is this — is-a or has-a?)*

---

# PART C — Project structure 🔵

## C1 · What a real FastAPI project looks like

Everything so far is one file. That works to about 200 lines, then it doesn't.

```
d8_structured_app/
├─ main.py          <- creates the app, plugs the routers in. Nothing else.
├─ schemas.py       <- the SHAPES of data (Pydantic models)
└─ routers/
   ├─ __init__.py   <- the empty file that makes "routers" importable
   ├─ students.py   <- everything about students
   └─ health.py     <- everything about health
```

Bigger projects add two more, and it's worth naming them now so Modules 3–4 aren't a surprise:

| Folder | Holds |
| --- | --- |
| `models/` | **database** tables (Module 2) |
| `schemas/` | **API** shapes — what goes in and out |
| `services/` | business logic that isn't about HTTP at all |

❓ **Ask the class:** *"Why would `models/` and `schemas/` both exist? Isn't a student just a student?"*
→ The database row has a password hash, an internal id, a `created_at`. The API response must not. **Same idea, two shapes, on purpose** — exactly the `StudentIn`/`StudentOut` split in §D9.

**Rule of thumb:** a new area of the product = a new file in `routers/`.

---

# PART D — FastAPI · 45 min 🟢

## D1 · What it is, in one minute

**FastAPI** is a Python library for building APIs. It reads your **type hints** and, from them, validates requests and generates documentation. **Uvicorn** is the program that actually listens on the port and runs your app — `fastapi dev` starts it for you.

Three reasons it's the default choice in 2026: it's fast, the validation is free, and `/docs` means you never write API documentation by hand.

## D2 · Your first app 🖥️ [`d1_hello_api.py`](../code/01_foundations/d1_hello_api.py)

```python
from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/")
def home():
    return {"message": "Backend is live"}
```
```bash
uv run fastapi dev 01_foundations/d1_hello_api.py
```

Read it aloud in this order — it maps to how they need to think:
- `@app.get("/")` — *when someone sends a GET to this address…*
- `def home()` — *…run this function.*
- `return {...}` — *…and send this dict back as JSON.*

💡 **AHA #1 — free interactive docs.** Open **`/docs`**.
> *"You wrote eight lines. FastAPI handed you a documented, clickable, testable console — and it stays in sync, because it's generated from your code."*

Make everyone click **Try it out → Execute**. That click is where the session turns.

Three addresses to show: **`/docs`** (interactive) · **`/redoc`** (laid out for reading) · **`/openapi.json`** (the machine-readable description both are built from).

🧑‍🏫 **Practical tip:** ban the URL bar for the rest of the day. It can only do GET — useless the moment they need POST, and they won't have built the `/docs` habit.

🧑‍🏫 **Practical tip:** `fastapi dev` **reloads on save**. Prove it — change the message, save, refresh. Now they won't restart by hand all day, and when a change *doesn't* appear they'll know to check the terminal for a syntax error.

❓ **Ask the class:** *"What is `127.0.0.1`, and why can't your friend open it?"* → It means *this machine*. Making it reachable is Module 3. Name it, park it.

## D3 · The HTTP methods

| Method | Means | Example |
| --- | --- | --- |
| **GET** | read something | `GET /students` |
| **POST** | create something new | `POST /students` |
| **PUT** | replace it entirely | `PUT /students/1` |
| **PATCH** | change part of it | `PATCH /students/1` |
| **DELETE** | remove it | `DELETE /students/1` |

Today: GET and POST. **Module 2 builds all five** and covers when PUT beats PATCH.

📌 The address is the **noun**, the method is the **verb**. `GET /deleteStudent` is wrong twice over.

## D4–D6 · Params, and putting rules on them 🖥️ [`d2_params.py`](../code/01_foundations/d2_params.py)

| | Looks like | Answers | Use for |
| --- | --- | --- | --- |
| **Path param** | `/students/7` | *which one?* | identifying one specific thing |
| **Query param** | `/students?branch=CSE&limit=5` | *how do you want it?* | filtering, sorting, paging — always optional |

```python
@app.get("/students/{student_id}")
def get_student(student_id: int):                 # the int hint IS the validation
    return {"id": student_id, "name": "Ada"}

@app.get("/students")
def list_students(branch: str | None = None, limit: int = 10):
    return {"branch": branch, "limit": limit}
```
FastAPI worked out which is which on its own: `student_id` appears in the path, `branch` and `limit` don't. **You configured nothing.**

💡 **AHA #2 — validation you didn't write.** Open **`/students/abc`**:
```json
{"detail":[{"type":"int_parsing","loc":["path","student_id"],
 "msg":"Input should be a valid integer, unable to parse string as an integer","input":"abc"}]}
```
A clean **422**, naming the exact field and the exact problem — from the single word `int`. Ask them to picture hand-writing that for forty fields.

**Now add real rules** with `Path()` and `Query()`:
```python
@app.get("/courses/{course_id}")
def get_course(
    course_id: int = Path(ge=1, description="Course id, 1 or higher"),
    search: str | None = Query(default=None, min_length=3, max_length=20),
    limit: int = Query(default=10, ge=1, le=100),
):
    return {"course_id": course_id, "search": search, "limit": limit}
```
Verified live: `/courses/0` → **422** · `/courses/5?search=a` → **422** · `/courses/5?limit=999` → **422** · `/courses/5?search=abc` → **200**.

💡 **AHA:** every rule appears in `/docs` automatically. **The rule and its documentation are the same line of code**, so they can never drift apart.

❓ **Ask the class:** *"Should `limit` be a path param or a query param?"* → Query. It doesn't identify a resource, it shapes the answer, and it must be optional.

## D7–D9 · Body, status codes, `response_model` 🖥️ [`d3_body_and_status.py`](../code/01_foundations/d3_body_and_status.py)

So far data only went **out**. A **POST** sends something in — and then one question matters: *is it what you expected?*

```python
class StudentIn(BaseModel):        # what we ACCEPT
    name: str
    branch: str = "CSE"
    age: int
    password: str

class StudentOut(BaseModel):       # what we RETURN. No password. On purpose.
    id: int
    name: str
    branch: str

@app.post("/students", status_code=status.HTTP_201_CREATED, response_model=StudentOut)
def create_student(new_student: StudentIn):
    student = {"id": len(students) + 1, "name": new_student.name,
               "branch": new_student.branch, "age": new_student.age,
               "password": new_student.password}
    students.append(student)
    return student                 # age and password are DROPPED on the way out
```

Run it. The function returns a dict with a password in it, and the response is:
```json
{"id":2,"name":"Raj","branch":"CSE"}
```
💡 **AHA #3 — the shape of your answer is a rule, not a hope.** `response_model` filtered the password out. Say it plainly: *"Leaking a password field is a real bug that has ended real jobs. One line prevents it."*

**Status codes** — the four for today: **200** here you go · **201** created · **404** no such thing · **422** your request was malformed. Use the `status` module (`status.HTTP_201_CREATED`) rather than bare numbers — it reads better and autocompletes.

## D10 · Saying "no" properly 🖥️ [`d4_errors.py`](../code/01_foundations/d4_errors.py)

```python
raise HTTPException(status_code=404, detail=f"No student with id {student_id}")
```
**`raise`, don't `return`.** The file has both side by side:

| Endpoint | Body | Status |
| --- | --- | --- |
| `raise HTTPException(404, ...)` | `{"detail":"No student with id 99"}` | **404** ✅ |
| `return {"error": "not found"}` | `{"error":"not found"}` | **200** ❌ |

❓ **Ask the class:** *"Both say 'not found'. Why is the second one a bug?"*
→ Because the **caller's code** doesn't read English. It checks the status. A 200 means "success", so a mobile app cheerfully carries on with nonsense. Show both in `/docs` and make them watch the number, not the text.

📌 Put the id **in the message**. `"No student with id 99"` beats `"Not found"` at 2 a.m.

## D11 · `async def` vs `def` 🖥️ [`d5_async_vs_sync.py`](../code/01_foundations/d5_async_vs_sync.py)

Most courses hand-wave this. It's worth seven honest minutes.

```python
@app.get("/sync")
def slow_sync():
    time.sleep(2)              # FastAPI runs this in a separate thread
    return {"waited": 2}

@app.get("/async")
async def slow_async():
    await asyncio.sleep(2)     # while this waits, the server serves others
    return {"waited": 2}

@app.get("/broken")
async def broken():
    time.sleep(2)              # WRONG - blocking call inside async def
    return {"problem": "blocks the server"}
```

**The demo that proves it** — hit each endpoint twice at the same time and watch the clock. Measured:

| Two requests at once | Wall clock | Why |
| --- | --- | --- |
| `/sync` (plain `def`) | **2s** | FastAPI ran them in separate threads |
| `/broken` (blocking call in `async def`) | **4s** | one froze the whole server; the second queued |

💡 **AHA:** *"Plain `def` was safe. The `async def` was the dangerous one — because the code inside it lied about waiting."*

**Rule of thumb, on the board:**
- Not sure? Use plain **`def`**. FastAPI handles it safely.
- Using a library built for async? Use **`async def`** and `await` it.
- **Never** put a blocking call inside `async def`.

🧑‍🏫 **Practical tip:** two terminals with `curl`, or two `/docs` tabs clicked quickly, is enough to show it. Have the two commands ready to paste — fumbling this live kills the moment.

## D12 · `Depends` — dependency injection 🔵 🖥️ [`d6_depends.py`](../code/01_foundations/d6_depends.py)

A dependency is **just a function** that FastAPI calls for you, handing you the result.

```python
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/students")
def list_students(page: dict = Depends(pagination)):
    return {"students": [...], "page": page}

@app.get("/courses")
def list_courses(page: dict = Depends(pagination)):     # same params, zero repetition
    ...
```

**The real use — a guard:**
```python
def verify_token(x_token: str | None = Header(default=None)):
    if x_token != "secret123":
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return x_token

@app.get("/admin")
def admin_area(token: str = Depends(verify_token)):
    return {"message": "welcome, admin"}
```
Verified: no token → **401** · wrong token → **401** · `x-token: secret123` → **200**.

💡 **AHA:** `admin_area` contains **no checking code at all**. The dependency ran first; when it raised, the endpoint never ran. *"This is how the database session arrives in Module 2, and how every login works in Module 3."*

## D13 · Middleware 🔵 🖥️ [`d7_middleware_and_background.py`](../code/01_foundations/d7_middleware_and_background.py)

A wrapper around **every single request**:
```
request ──▶ [middleware] ──▶ your endpoint ──▶ [middleware] ──▶ response
```

```python
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)          # run the actual endpoint
    response.headers["X-Process-Time"] = f"{time.perf_counter() - started:.4f}"
    return response
```
Verified: every response now carries `x-process-time: 0.0017`, and the terminal logs `GET / took 0.0017s` — **for endpoints you never edited.**

**CORS** is the ready-made one they'll actually need:
```python
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], ...)
```
❓ **Ask the class:** *"Your React app on port 3000 calls this API on 8000 and the browser blocks it. Why?"*
→ Browsers refuse cross-origin calls unless the server says they're allowed. CORS middleware is the server saying so. **Every student meets this bug in their capstone** — 90 seconds now saves an hour later.

📌 Use it for things that apply to *everything*: logging, timing, CORS, auth headers. Not for one endpoint's logic.

## D14 · Background tasks 🔵

```python
@app.post("/signup")
def signup(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_log, f"welcome email queued for {email}")
    return {"message": "signed up"}      # returns NOW; the slow bit runs after
```
Verified: the response comes back instantly, and `LOG: welcome email queued for ada@lpu.in` appears in the terminal **two seconds later**.

💡 **AHA:** *"The user isn't waiting for the welcome email. Why should the response be?"* Right for emails, reports, cleanup. Wrong for anything the caller needs in the answer.

## D15 · `APIRouter` 🔵 🖥️ [`d8_structured_app/`](../code/01_foundations/d8_structured_app/)

This is §C1 made real — the same API, split into files.

```python
# routers/students.py
router = APIRouter(prefix="/students", tags=["students"])

@router.get("")                     # this is /students - the prefix is added
def list_students(): ...

# main.py
app = FastAPI(title="Student API (structured)")
app.include_router(students.router)
app.include_router(health.router)
```
`prefix` means you write the path once. `tags` groups the endpoints in `/docs` — open it and show the groups.

🧑‍🏫 **Practical tip:** run this one *after* the single-file app, then open `/docs` on both. **Identical documentation, completely different file layout.** That's the point: structure is for humans, not for the machine.

## D16 · Named, not taught 📖
`lifespan` (run code at startup/shutdown — used for database connections in Module 2) · `TestClient` (automated tests) · WebSockets (live two-way connections) · static files and HTML templates. One sentence each, so students know the words exist.

---

## ✏️ Exercise set 2 — FastAPI · 8 min

Blank file. Test everything from `/docs`.

1. **`GET /ping`** returning `{"pong": true}`.
2. **`GET /books/{book_id}`** where `book_id` must be **1 or higher**. Check that `0` is rejected.
3. **`GET /books`** with query params `author` (optional) and `limit` (default 10, between 1 and 50).
4. **`POST /books`** taking a Pydantic model with `title` and `author`, returning **201**.
5. Make `GET /books/{book_id}` return a **404** whose message includes the id that wasn't found.

---

# PART E — Pydantic · 22 min 🟢

## E1 · A class that checks itself 📓 [notebook §14](../notebooks/01_Python_Refresher.ipynb)

```python
class Student(BaseModel):
    name: str                 # required
    age: int                  # required
    branch: str = "CSE"       # optional - has a default
    email: str | None = None  # optional - may genuinely be nothing
```

**Coercion vs rejection** — the distinction that confuses everyone:
```python
Student(name="Raj", age="21")       # -> age is 21, an int.  Converted, safely.
Student(name="Meera", age="hello")  # -> ValidationError.    Cannot convert.
```
❓ **Ask the class:** *"`\"21\"` was accepted but `\"hello\"` wasn't. What's the rule?"* → If it can be turned into the declared type without losing meaning, it is. Otherwise it's refused.

**The error is data, not a sentence:**
```python
for problem in error.errors():
    print(problem["loc"], "->", problem["msg"])
# ('name',) -> Field required
# ('age',)  -> Input should be a valid integer, unable to parse string as an integer
```
📌 **That structure is exactly what your API sends back as a 422.** Point at the earlier `/students/abc` output — same shape. Two things they thought were unrelated are the same thing.

**In and out:** `model_dump()` → dict · `model_dump_json()` → JSON string · `Model.model_validate(data)` → build one from incoming data.

⚠️ **2026 note:** this is **Pydantic v2**. Tutorials using `@validator`, `.dict()` or `.json()` are v1 — the modern names are `@field_validator`, `.model_dump()` and `.model_dump_json()`.

## E2 · `Field()` — real rules 📓 [notebook §15](../notebooks/01_Python_Refresher.ipynb)

```python
class Student(BaseModel):
    name: str = Field(min_length=2, max_length=50, description="Full name",
                      examples=["Ada Lovelace"])
    age: int = Field(ge=16, le=100)
    cgpa: float = Field(gt=0, lt=10)
    roll_no: str = Field(pattern=r"^\d{8}$")     # exactly 8 digits
```

| | Means |
| --- | --- |
| `gt` / `lt` | greater than / less than (strictly) |
| `ge` / `le` | greater or equal / less or equal |
| `min_length` / `max_length` | for strings and lists |
| `pattern` | a regular expression the string must match |
| `description` / `examples` | not validation — they show up in `/docs` |

Each rule broken on purpose, verified:
```
name    -> String should have at least 2 characters
age     -> Input should be greater than or equal to 16
cgpa    -> Input should be less than 10
roll_no -> String should match pattern '^\d{8}$'
```
💡 **AHA:** they never wrote an `if`. Every message above was generated, and every rule is now visible in `/docs`.

## E3 · Custom rules 📓 [notebook §15](../notebooks/01_Python_Refresher.ipynb)

When `Field()` can't express it, write it:

```python
@field_validator("username")            # ONE field
@classmethod
def username_must_be_lowercase(cls, value: str) -> str:
    if not value.islower():
        raise ValueError("username must be lowercase")
    return value

@field_validator("branch")              # a validator can CLEAN instead of reject
@classmethod
def tidy_branch(cls, value: str) -> str:
    return value.strip().upper()        # "  cse " -> "CSE"

@model_validator(mode="after")          # ACROSS fields
def passwords_must_match(self):
    if self.password != self.confirm_password:
        raise ValueError("passwords do not match")
    return self
```

❓ **Ask the class:** *"Why can't `passwords must match` be a `field_validator`?"*
→ Because a field validator only sees **its own** field. "Do these two agree?" is a question about the whole object, so it needs `model_validator`. That's the entire distinction.

📌 Two jobs, not one: a validator can **reject** bad input *or* **clean** acceptable input. `.strip().upper()` on every branch code means the rest of your code never worries about whitespace again.

## E4 · Ready-made types, nesting, locking down 🔵 📓 [notebook §16](../notebooks/01_Python_Refresher.ipynb)

```python
class Profile(BaseModel):
    id: UUID
    email: EmailStr                          # needs the email-validator package
    website: HttpUrl
    joined: date                             # "2026-08-01" comes out a real date object
    branch: Branch                           # an Enum - a fixed set of allowed values
    status: Literal["active", "inactive"]    # like an Enum, written inline
```
`Profile(email="not-an-email", ...)` → `value is not a valid email address: An email address must have an @-sign.`

**Nested models** validate all the way down — a plain dict becomes a real `Address`:
```python
Student(name="Ada", address={"city": "Jalandhar", "pincode": "144411"})
# student.address is an Address object, not a dict
```

**Locking it down:**
```python
model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
```
❓ **Ask the class:** *"Without `extra=\"forbid\"`, someone POSTs `is_admin: true` to your signup. What happens?"*
→ It's silently ignored — harmless here. But so is a **typo**: send `nmae` instead of `name` and you get "field required" for `name` while `nmae` vanishes without comment. `extra="forbid"` turns silence into an error.

## E5 · `In` vs `Out` models — say it once more
`StudentIn` accepts the password. `StudentOut` doesn't have one. Same idea as `models/` vs `schemas/` in §C1. This is the habit that keeps private data private, and it costs one extra class.

## E6 · `pydantic-settings` 📖
A separate package that reads configuration from environment variables into a validated model — so a missing `DATABASE_URL` fails loudly at startup instead of mysteriously at midnight. **Used in Module 3.** Name it, move on.

---

## ✏️ Exercise set 3 — Pydantic · 5 min

Blank file, plain Python — no server needed.

1. A **`Product`** model: `name` (2–100 characters), `price` (greater than 0), `quantity` (0 or more), `category` (one of `"books"`, `"food"`, `"tech"` — use `Literal`).
2. Create one valid product. Then create four invalid ones, one per rule, and print `error.errors()` for each.
3. Add a **`@field_validator`** that upper-cases the name.
4. Add a **`@model_validator`** rejecting any product where `price × quantity` exceeds 100000.

---

## 🧪 Main build — your own Student API · 12 min

Blank file. They may look at the demos, but they type it themselves.

1. `GET /health` → `{"status": "ok"}`
2. An in-memory list with three students.
3. A `StudentIn` model with **real rules**: name 2–50 characters, age 16–100, password at least 6 characters.
4. A `StudentOut` model **without** the password.
5. `GET /students` → the list, and `GET /students?branch=CSE` → filtered.
6. `GET /students/{student_id}` → one student, or a **404** naming the missing id.
7. `POST /students` → **201**, returns `StudentOut`.
8. Test all of it from `/docs`.

The finished version is [`student_api.py`](../code/01_foundations/student_api.py) — **don't show it until they've tried.**

✅ **Checkpoint — walk the room.** Everyone should have seen a green **201**, a red **404**, and a **422**. Blockers, in the order they happen:
- **`Address already in use`** — a demo server is still running. `Ctrl+C` it, or add `--port 8001`.
- **Editing one file while running another.** Very common. Check the terminal names the file they think it does.
- **Forgetting to save** — `fastapi dev` reloads on save, and only on save.
- **Indentation** under the decorator.

🧑‍🏫 **Practical tip — the route-order trap, if it comes up.** Order does **not** matter between `/students` and `/students/{student_id}`; they never collide. It matters when a **fixed** path sits under a **param** path: declare `/students/{student_id}` first, then add `/students/count`, and calling `/students/count` returns a **422** — the param route matched first and tried to read `"count"` as an `int`. **Fixed routes go above param routes.**

---

## 📝 Revision & quiz · 8 min

**Say it back** — get the class to finish each line:
class = blueprint, object = instance · `self` = this object · encapsulation keeps data with its rules · is-a vs has-a · `@dataclass` writes `__init__`, `__repr__`, `__eq__` · pip installs, venv isolates, uv does both plus Python itself · an API is a message in and a message out · a returned dict becomes JSON · a type hint becomes validation · `/docs` is free and always current · `response_model` decides what goes *out* · `raise`, don't `return`, on an error · `Field()` for simple rules, `@field_validator` for one field, `@model_validator` across fields · in-memory data dies with the server.

**Quiz** — *answers in italics, for me.*
1. Class or object: `Student`? And `ada = Student(1, "Ada")`? *Class; object (instance).*
2. What does `self` refer to? *The object the method was called on.*
3. Which pillar keeps data with the rules that guard it? *Encapsulation.*
4. `Student` holds a list of `Course`. Inheritance or composition? *Composition — has-a.*
5. What three methods does `@dataclass` write for you? *`__init__`, `__repr__`, `__eq__`.*
6. What problem does a virtual environment solve? *Two projects needing different versions of the same package.*
7. What does a lock file add that `requirements.txt` doesn't? *Exact pinned versions, so every machine installs identically.*
8. In `/students?limit=5`, what kind of param is `limit`? *A query param.*
9. What produced the 422 on `/students/abc`? *The `int` type hint — validation ran before the function.*
10. What does `response_model=StudentOut` do? *Filters the response to that shape — extra fields like `password` are dropped.*
11. Why is `return {"error": "not found"}` a bug? *It sends status 200; the caller's code reads "success". Use `raise HTTPException(404, ...)`.*
12. Two requests hit a plain `def` endpoint that sleeps 2s. How long? *About 2 seconds — FastAPI runs `def` endpoints in a threadpool.*
13. `Field(ge=16)` — what does `ge` mean? *Greater than or equal to.*
14. Which validator can compare two fields? *`@model_validator` — `@field_validator` only sees its own field.*
15. What does `extra="forbid"` protect you from? *Fields you never declared — including typos in field names — being silently ignored.*

---

## 🏠 Homework
1. **Course API.** A separate API for `Course`: `id`, `code` (pattern `^[A-Z]{2}\d{3}$`), `title` (3–100 chars), `credits` (1–6). `GET /courses`, `GET /courses/{id}` with a 404, `POST /courses` returning 201 and a `CourseOut`.
2. **Split it up.** Move that API into `main.py` + `schemas.py` + `routers/courses.py`, the way §C1 lays out. Confirm `/docs` looks identical afterwards.
3. **A student has many courses.** In plain Python — no API — model a `Student` holding a list of `Course` objects and print a student with their course codes. *This is what a database calls a relationship; it returns in Module 2.*
4. **Break it on purpose.** Send five deliberately wrong requests to your API — missing field, wrong type, too short, out of range, unknown id. Write down the status code and message for each and bring them next session.

---

## 📊 Coverage map — where every topic sits

Tracker items owned by this module (all ✅ covered above):

| Tracker checklist item | Covered in |
| --- | --- |
| Python refresher + OOP (4 pillars, dataclasses) | A1–A3, B1–B5 |
| Virtual environments + package management (uv) | §0 |
| FastAPI intro + first endpoint + `/docs` | D1–D2 |
| Path & query params + validation | D4–D6 |
| Pydantic request/response models | D7–D9, E1–E5 |

Beyond the tracker, added on request — all covered, marked by depth:

| Topic | Depth |
| --- | --- |
| Project structure (`routers/`, `schemas/`, `models/`) | 🔵 C1 + D15 |
| `Depends` / dependency injection | 🔵 D12 |
| Middleware + CORS | 🔵 D13 |
| Background tasks | 🔵 D14 |
| `async def` vs `def` | 🟢 D11 |
| `response_model`, status codes | 🟢 D7–D9 |
| Custom validators, nested models, `ConfigDict` | 🟢 E3 · 🔵 E4 |
| lifespan · `TestClient` · WebSockets · static files | 📖 D16 |
| `pydantic-settings` | 📖 E6 |

**Deliberately held back** — say so out loud so students know they're coming, not missing: full CRUD with PUT/PATCH/DELETE and proper error handling, plus databases and relationships (**Module 2**) · authentication, roles, Redis, Docker, deployment (**Module 3**).

---

## 🔗 Resources *(check on the teaching day — these move)*
- FastAPI tutorial — https://fastapi.tiangolo.com/tutorial/
- Pydantic — https://docs.pydantic.dev
- uv — https://docs.astral.sh/uv
- Python dataclasses — https://docs.python.org/3/library/dataclasses.html
- HTTP status codes, human version — https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

---

## ⏭️ Next module — *APIs & Databases*
The same Student API, done properly and then given a memory. First: all five HTTP methods, correct status codes, errors a client can act on, and code that isn't one long file. Then it stops losing everything on `Ctrl+C` — Postgres in a container, SQLAlchemy models, and a real one-to-many relationship.
