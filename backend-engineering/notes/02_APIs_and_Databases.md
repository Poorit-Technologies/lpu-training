# APIs & Databases — REST · CRUD · SQL · PostgreSQL · SQLAlchemy

**Module 2 of 3 · Backend · 3 hours live** · runs locally in VS Code
**Code:** [`code/02_apis_and_databases/`](../code/02_apis_and_databases/) · **Notebook:** [`02_SQL_Basics.ipynb`](../notebooks/02_SQL_Basics.ipynb) · **Setup:** [SETUP.md](../SETUP.md)

> **Trainer context:** today the Module-1 app grows up twice. First it becomes a **proper API** — every verb, every error, one shape for failure. Then it gets a **real database**, so the data stops dying when the server restarts. Those are the two halves, and the hinge between them is `Depends`.
> **Win condition:** every student restarts their server, hits `GET /students`, and the data is **still there**.

**How to read the markers:**

| | Meaning |
| --- | --- |
| 🟢 | **Teach live.** This is the 3-hour path. |
| 🔵 | **Demo if time** — ~5 min, run the file, talk over it. Skip without guilt; it's written up in full below. |
| 📖 | **Read at home.** Named in class in one sentence, no more. |
| 🖥️ | A file *you* run on the projector. |
| 📓 | A section of the **Colab notebook** students run themselves. |
| ✏️ | A task *they* do. Blank file, no starter code. |

## ⏱️ The live 3-hour path

| Time | Section | |
| --- | --- | --- |
| 0–10 | 🔁 Recap + quiz on Module 1 · **start the Postgres pull now** | 🟢 |
| 10–25 | **F.** REST design — nouns, the method table, idempotency, status codes | 🟢 |
| 25–55 | **G.** Full CRUD — PUT, PATCH, DELETE 204, 404/409/422 | 🟢 |
| 55–70 | **H.** Error handling — one envelope, custom handlers | 🟢 |
| 70–85 | **I.** `Depends` + `APIRouter` + the layout that survives | 🟢 |
| 85–110 | **J.** SQL you actually need 📓 *notebook, in Colab* | 🟢 |
| 110–125 | **K.** Postgres in one line — `docker compose up -d` | 🟢 |
| 125–160 | **L.** SQLAlchemy 2.x — models, session, every route on the DB | 🟢 |
| 160–172 | **M.** Relationships + 🧪 the Course API | 🟢 |
| 172–180 | Recap + quiz | 🟢 |

🧑‍🏫 **If you are running behind**, cut in this order: §M3 (the JOIN-shaped read) → §H2 (custom handlers, keep the envelope idea) → §I3 (layout — the code is there to read). **Never cut §L2** (`get_db`); everything after it depends on it.

> 🔴 **The one thing that can derail today is Docker.** Start `docker compose up -d` pulling **at minute 0**, during the recap — the image is ~400 MB and a room full of laptops on one Wi-Fi is the slow part, not the database. By the time you reach §K at minute 110 it is already down. The SQL block (§J) is a Colab notebook precisely so a student with broken Docker still learns SQL.

## 🎯 Objectives
By the end a student can:
- Design a **REST endpoint** by naming a noun and choosing a method, and defend the choice.
- Implement **full CRUD** — including the difference between PUT and PATCH, and why DELETE returns 204.
- Return **404, 409 and 422** deliberately, in **one consistent error shape**.
- Read and write the **SQL** they need: `CREATE`, `INSERT`, `SELECT … WHERE`, `UPDATE`, `DELETE`, `JOIN`, and explain PK vs FK.
- Start **PostgreSQL** with one command and connect to it.
- Define **SQLAlchemy 2.x models**, get a **session through `Depends`**, and put every route on the database.
- Model a **one-to-many relationship** with a `ForeignKey` and read it back.

---

## 🔁 Recap · 10 min 🟢

**Do this while the Postgres image downloads.** First command of the day, before you say anything else:

```bash
docker compose -f 02_apis_and_databases/docker-compose.yml up -d
```

Then talk. Five questions, hands up, 30 seconds each — the full bank is in the run book:

1. What does `response_model` actually *do* to the response?
2. `raise HTTPException(404)` vs `return {"error": ...}` — why is the second a bug?
3. Class vs object, in one sentence.
4. What is the difference between a path param and a query param?
5. Where did yesterday's data go when you stopped the server?

That last one is today's hook. Let it hang.

❓ **Ask the class:** *"You added five students yesterday. You pressed Ctrl+C. Where are they now?"*
→ Gone. The list lived in RAM, and RAM is rented. Say it plainly: **"Everything you built yesterday forgets."** Today it stops forgetting.

📌 Draw the arc on the board and leave it there all session:

```
   in memory          →      proper API         →      real database
   (Module 1)                (Parts F–I)               (Parts J–M)
   dies on restart           every verb, one           survives anything
                             error shape
```

---

# PART F — REST design · 15 min 🟢

## F1 · The two rules

Everything about REST design that matters today fits in two lines:

> **The path is a NOUN. The method is the VERB.**

That's it. `GET /deleteStudent` is wrong twice over — it uses a verb in the path, and it uses the wrong method for the job.

| Wrong | Right |
| --- | --- |
| `GET /getAllStudents` | `GET /students` |
| `POST /createStudent` | `POST /students` |
| `GET /deleteStudent?id=1` | `DELETE /students/1` |
| `POST /updateStudentName` | `PATCH /students/1` |

❓ **Ask the class:** *"Fix `GET /getAllStudentsList` out loud."* Then: *"Why is plural better than `/student`?"*
→ Because `/students` is a **collection** and `/students/1` is **one item in it**. The plural reads correctly in both.

## F2 · The method table, and the word that matters

| Method | Means | On the collection | On one item | Idempotent? |
| --- | --- | --- | --- | --- |
| `GET` | read | `GET /students` | `GET /students/1` | ✅ |
| `POST` | create | `POST /students` | — | ❌ |
| `PUT` | replace entirely | — | `PUT /students/1` | ✅ |
| `PATCH` | change part | — | `PATCH /students/1` | ❌ (usually) |
| `DELETE` | remove | — | `DELETE /students/1` | ✅ |

**Idempotent** = doing it twice is the same as doing it once.

💡 **AHA #1 — idempotency is why your phone can retry.** Say it as a story: your app sends `POST /students`, the train goes into a tunnel, the reply is lost. Did it work? Nobody knows. Retry and you might create two students. Now the same story with `PUT /students/1`: send it five times, the student ends up in the same state. **That is why the retry button on a payment screen is terrifying and the retry on a "save profile" screen is not.**

❓ **Ask the class:** *"Is `DELETE /students/1` idempotent, even though the second call 404s?"*
→ Yes. Idempotency is about **the state of the server**, not about the status code you get back. After call one and after call five, the student is equally gone.

## F3 · PUT vs PATCH — the one that gets argued about

```
Student 1 = {"id": 1, "name": "Ada", "branch": "CSE", "age": 20}

PUT   /students/1  {"name": "Ada", "branch": "ECE", "age": 20}   -> replaces the whole record
PATCH /students/1  {"branch": "ECE"}                             -> changes one field
```

**The trap:** send a PUT with a field missing, and a strict PUT **wipes it**. That's not a bug — that's what "replace" means.

📌 Rule of thumb for the board: *"PUT = here is the new record. PATCH = here is the change."*

## F4 · The status-code map

Students memorise the numbers and still pick wrong ones, so give them the *question* each number answers.

| Code | Name | Say it as |
| --- | --- | --- |
| **200** | OK | "here you go" |
| **201** | Created | "made it, here it is" |
| **204** | No Content | "done — and there is deliberately nothing to show you" |
| **400** | Bad Request | "your request is wrong in a way I can't be more specific about" |
| **404** | Not Found | "no such thing" |
| **409** | Conflict | "that clashes with something that already exists" |
| **422** | Unprocessable | "the shape is wrong" — FastAPI sends this for you |
| **500** | Server Error | "*I* broke. Not you." |

💡 **The 4 vs 5 rule, worth 30 seconds:** **4xx means you messed up. 5xx means I messed up.** A 500 in your logs is always your bug — never blame the caller for it.

---

# PART G — Full CRUD · 30 min 🟢 🖥️ [`g1_crud_full.py`](../code/02_apis_and_databases/g1_crud_full.py)

Module 1 built `GET` and `POST`. Today the other three arrive, and the app finally does everything.

## G1 · Where we left off

Open the Module-1 app next to today's file and show they're the same shape. The list is still in memory — **that's deliberate**. One new thing at a time: today's first hour changes the *API*, not the *storage*.

```python
students: list[dict] = [
    {"id": 1, "name": "Ada", "branch": "CSE", "age": 20},
]
```

## G2 · PUT — replace it

```python
@app.put("/students/{student_id}", response_model=StudentOut)
def replace_student(student_id: int, incoming: StudentIn):
    student = _find(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail=f"No student with id {student_id}")
    student.update(incoming.model_dump())      # every field replaced
    return student
```

`incoming: StudentIn` means Pydantic has already checked the body before your line runs. **You did not write a single validation line** — call that back to Module 1.

## G3 · PATCH — change part of it

This is the one with a real trick in it.

```python
class StudentPatch(BaseModel):                 # every field optional
    name: str | None = None
    branch: str | None = None
    age: int | None = None

@app.patch("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, changes: StudentPatch):
    student = _find(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail=f"No student with id {student_id}")
    student.update(changes.model_dump(exclude_unset=True))   # <- the trick
    return student
```

💡 **AHA #2 — `exclude_unset=True` is the whole lesson.** Without it, every field the caller *didn't* send arrives as `None` and you helpfully erase their name.

❓ **Ask the class BEFORE you run it:** *"The caller sends only `{\"branch\": \"ECE\"}`. Without `exclude_unset`, what happens to `name`?"*
→ It becomes `None`. Then run it both ways and show the wreckage. This is the single most memorable minute of Part G.

📌 Say it: *"`None` because they sent null" and "`None` because they said nothing" are different facts, and `exclude_unset` is how you tell them apart.*

## G4 · DELETE — and the 204 that confuses everyone

```python
@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int):
    student = _find(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail=f"No student with id {student_id}")
    students.remove(student)
    return None                                # 204 means: no body. Not an empty one.
```

❓ **Ask the class:** *"Why not return `{\"deleted\": true}` with a 200?"*
→ You can — plenty of APIs do. But 204 already *means* "done, nothing to show". The status code is the message; repeating it in a body is noise. Show it in `/docs`: the response body area is genuinely empty, and that surprises people.

⚠️ **Watch for this in class:** a `204` endpoint that returns a body raises an error in newer Starlette versions. If a student's DELETE explodes, look for a stray `return {...}`.

## G5 · 409 — the one nobody teaches

```python
@app.post("/students", status_code=201, response_model=StudentOut)
def create_student(incoming: StudentIn):
    if any(s["email"] == incoming.email for s in students):
        raise HTTPException(status_code=409, detail=f"{incoming.email} is already registered")
    ...
```

**404 = it isn't there. 409 = it's already there.** Those are the two halves of "the world isn't how your request assumes it is". 422 is different again — that's *"your JSON is the wrong shape"*, and Pydantic raises it before your function is even called.

📌 Three-line summary for the board:
- **422** — the request is malformed. *Pydantic said no.*
- **404** — the request is fine, the thing doesn't exist.
- **409** — the request is fine, the thing exists and shouldn't.

## ✏️ Exercise set 1 — CRUD · 6 min

Blank file, no starter code. Statements only:

1. Add `PUT /courses/{code}` that replaces a course, 404 if the code is unknown.
2. Add `PATCH /courses/{code}` that changes only the fields sent.
3. Add `DELETE /courses/{code}` returning 204, and 404 on a second call.
4. Make `POST /courses` return **409** when the course code already exists.

---

# PART H — Error handling · 15 min 🟢 🖥️ [`h1_errors_envelope.py`](../code/02_apis_and_databases/h1_errors_envelope.py)

## H1 · One shape, always

Right now the app can fail in three different shapes: FastAPI's `{"detail": "..."}`, Pydantic's validation array, and whatever a crash produces. **The person consuming your API has to write three different bits of code to read your failures.**

Pick one shape and never deviate:

```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "No student with id 99",
    "status": 404
  }
}
```

💡 **AHA #3 — a machine-readable `code` is the bit that matters.** `message` is for the human reading logs at 2 a.m. `code` is for the mobile app that needs to decide whether to show "try again" or "log in again". Never make a caller regex your English.

## H2 · Custom handlers 🔵

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": _code_for(exc.status_code),
                           "message": exc.detail,
                           "status": exc.status_code}},
    )

@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR",
                           "message": "The request body is not the right shape.",
                           "status": 422,
                           "fields": exc.errors()}},
    )
```

One handler for HTTP errors, one for validation errors, and **every failure in the app now looks the same** — including ones in code you haven't written yet.

## H3 · The rule about leaking

📌 **Never put an exception's raw text in a response.** A stack trace or a database error message tells an attacker your table names, your file paths and your library versions. Log the detail, return the code.

```python
@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    logger.exception("unhandled error on %s", request.url.path)   # full detail -> logs
    return JSONResponse(status_code=500,
                        content={"error": {"code": "INTERNAL", "message": "Something went wrong.",
                                           "status": 500}})       # nothing useful -> the internet
```

---

# PART I — `Depends`, `APIRouter` and layout · 15 min 🟢 🖥️ [`i1_depends.py`](../code/02_apis_and_databases/i1_depends.py)

> 🔴 **Teach this cold, from zero, even if you demoed it in Module 1.** It's fifteen minutes and it removes every prerequisite between the two modules. Everything in Parts L and M rides on it, and so does every login in Module 3.

## I1 · `Depends` from zero

A dependency is **a function that runs before your endpoint, whose return value gets handed to it**.

```python
def get_page(limit: int = 10, offset: int = 0) -> dict:
    return {"limit": min(limit, 100), "offset": offset}   # one place to cap it

@app.get("/students")
def list_students(page: dict = Depends(get_page)):
    return students[page["offset"] : page["offset"] + page["limit"]]
```

Three things to say out loud:
1. FastAPI **calls the function for you** — you never write `get_page(...)`.
2. Its parameters become **your endpoint's parameters** — `/students?limit=5` still works, and it shows up in `/docs`.
3. If the dependency **raises**, the endpoint **never runs**.

```python
def verify_token(x_token: str = Header(...)):
    if x_token != SECRET:
        raise HTTPException(status_code=401, detail="Bad token")

@app.get("/admin", dependencies=[Depends(verify_token)])
def admin():
    return {"ok": True}          # no checking code in here at all
```

💡 **AHA #4 — this is the shape of every login you will ever write.** In Module 3 `verify_token` becomes `get_current_user`. In an hour, it becomes `get_db`. Same shape three times.

## I2 · `yield` — the version that cleans up

This is the one that matters this afternoon:

```python
def get_thing():
    thing = open_it()
    try:
        yield thing          # <- the endpoint runs here, with `thing`
    finally:
        thing.close()        # <- and this ALWAYS runs, even if the endpoint raised
```

📌 Say it: *"Everything before the `yield` is setup. Everything after is cleanup, guaranteed."* Park it — in §L2 this exact shape becomes the database session, and they'll have seen it before.

## I3 · `APIRouter` and the layout that survives

One file works to about 200 lines. Then:

```
course_api/
├─ main.py            # the app + wiring, nothing else
├─ database.py        # engine, SessionLocal, get_db
├─ models.py          # the DATABASE tables
├─ schemas.py         # the API shapes (in and out)
└─ routers/
   ├─ students.py
   └─ courses.py
```

```python
# routers/students.py
router = APIRouter(prefix="/students", tags=["students"])

@router.get("")                      # this is GET /students
def list_students(): ...

# main.py
app.include_router(students.router)
```

❓ **Ask the class:** *"Why are `models.py` and `schemas.py` two files? Isn't a Student a Student?"*
→ No. The **database row** has a password hash, an internal id, a `created_at`. The **API response** must never contain the first of those. Same idea, two shapes, on purpose — and Module 1's `response_model` was the first half of this lesson.

---

# PART J — The SQL you actually need · 25 min 🟢 📓 [notebook §2–8](../notebooks/02_SQL_Basics.ipynb)

> **This block runs in Colab, not locally.** Zero install, nothing to break, and it means the Postgres image can keep downloading in the background. Students open [`02_SQL_Basics.ipynb`](../notebooks/02_SQL_Basics.ipynb) and run it themselves — you drive the same cells on the projector.

## J1 · Why a database at all 📓 [notebook §1](../notebooks/02_SQL_Basics.ipynb)

❓ **Ask the class:** *"Why not just write the list to a JSON file when the server stops?"*
Let them argue, then land the four answers:
1. **Two requests at once.** Two writers, one file, one corrupted file.
2. **Finding things.** 100,000 students and you want the CSE ones — a file means reading all of them.
3. **Half-done writes.** The power cuts between "money left A" and "money reached B".
4. **Rules.** A database can *refuse* a duplicate email. A file can't refuse anything.

📌 Say it: *"A database is not a fancy file. It's a program whose entire job is to be careful with your data while many people touch it at once."*

## J2 · Tables, rows, columns, types 📓 [notebook §2](../notebooks/02_SQL_Basics.ipynb)

```sql
CREATE TABLE students (
    id      INTEGER PRIMARY KEY,
    name    TEXT    NOT NULL,
    branch  TEXT    NOT NULL DEFAULT 'CSE',
    age     INTEGER NOT NULL,
    email   TEXT    NOT NULL UNIQUE
);
```

Map it onto what they already know — this is the whole point of teaching OOP first:

| Python | SQL |
| --- | --- |
| class `Student` | table `students` |
| one object | one **row** |
| an attribute | a **column** |
| a type hint `age: int` | a column type `INTEGER` |
| a Pydantic `Field(gt=0)` | a **constraint** (`NOT NULL`, `UNIQUE`, `CHECK`) |

💡 **AHA #5 — a table is a class, a row is an object.** They already know how to model data; today they learn a second syntax for it.

**`PRIMARY KEY`** = the column that identifies a row uniquely, forever. **`UNIQUE`** = no duplicates allowed. **`NOT NULL`** = must have a value. These are the same job as Pydantic's rules, except the *database* enforces them — so they hold even if someone bypasses your API entirely.

## J3 · The four verbs 📓 [notebook §3–5](../notebooks/02_SQL_Basics.ipynb)

```sql
INSERT INTO students (name, branch, age, email) VALUES ('Ada', 'CSE', 20, 'ada@lpu.in');

SELECT * FROM students;
SELECT name, branch FROM students WHERE branch = 'CSE';
SELECT * FROM students WHERE age >= 20 ORDER BY name LIMIT 10;

UPDATE students SET branch = 'ECE' WHERE id = 1;

DELETE FROM students WHERE id = 1;
```

🚨 **The one warning worth shouting.** `UPDATE students SET branch = 'ECE';` — no `WHERE` — changes **every row in the table**. Same for `DELETE FROM students;`.

📌 Make them say it back: *"Write the `WHERE` first, then go back and write the `UPDATE`."* Everyone in this room will eventually run a `WHERE`-less update on something that matters. The habit is the only protection.

❓ **Ask the class:** *"`SELECT * FROM students WHERE branch = 'cse'` — how many rows for our data?"*
→ Zero. String comparison is case-sensitive. It's a five-second demo that saves an hour of confusion later.

## J4 · Two tables and a foreign key 📓 [notebook §6–7](../notebooks/02_SQL_Basics.ipynb)

```sql
CREATE TABLE courses (
    code  TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE students (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    course_code TEXT REFERENCES courses(code)     -- <- the foreign key
);
```

**A foreign key is a column that holds another table's primary key.** That's the entire definition.

💡 **AHA #6 — call all the way back to Module 1.** Put the OOP slide back up:

```python
class Student:
    def __init__(self, name):
        self.courses = []        # "a Student HAS courses"
```
*"Remember 'is-a vs has-a'? This is 'has-a', written down permanently. The database calls it a **relationship**."*

The FK also **enforces** it: insert a student whose `course_code` doesn't exist and the database refuses. Demo that refusal — the error message is the lesson.

## J5 · JOIN 📓 [notebook §7](../notebooks/02_SQL_Basics.ipynb)

```sql
SELECT students.name, courses.title
FROM students
JOIN courses ON students.course_code = courses.code;
```

📌 Read it out loud in English, in this order: *"take students, glue on the course whose code matches, then give me these two columns."* Students who can narrate a JOIN can write one.

## J6 · Named, not taught 📖

Say these exist, in one sentence each, so nobody thinks the subject is this small. All are written up in the notebook's §8 and in the take-home sheet:
- **`GROUP BY` + `COUNT`/`AVG`** — "how many students per branch" in one query.
- **Indexes** — why `WHERE email = ...` on a million rows can be instant.
- **Transactions** — `BEGIN` … `COMMIT`, so "money left A" and "money reached B" both happen or neither does.
- **Subqueries** — a `SELECT` inside a `SELECT`.
- **Migrations (Alembic)** — how you change a table's shape after real data is in it.

---

# PART K — Postgres, in one line · 15 min 🟢

## K1 · The command

```bash
docker compose up -d
```

That's the whole database installation. No installer, no service, no config file, no version conflict with the student sitting next to them.

❓ **Ask the class:** *"What did that actually do?"*
→ Downloaded a prepared box containing PostgreSQL, started it, and connected port 5432 on their laptop to port 5432 inside the box. **They did not install PostgreSQL. They rented a copy that came ready.**

## K2 · Reading the compose file 🖥️ [`docker-compose.yml`](../code/02_apis_and_databases/docker-compose.yml)

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: lpu
      POSTGRES_PASSWORD: lpu
      POSTGRES_DB: lpudb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql     # NOTE: not /data — see below
volumes:
  pgdata:
```

Six lines worth explaining, one at a time:
- `image:` — which prepared box.
- `environment:` — the user, password and database it creates on first boot.
- `ports: "5432:5432"` — **left is your laptop, right is inside the box.**
- `volumes:` — where the data lives **outside** the container, so `docker compose down` doesn't destroy it.

⚠️ **Trainer note — this bites, and it's new.** In **PostgreSQL 18** the official image moved its data directory, and the volume must target **`/var/lib/postgresql`**, not the `/var/lib/postgresql/data` that every older tutorial shows. Mount the old path on 18 and *nothing errors* — the data just silently lands outside your volume and vanishes on the next `down`. If you're demoing from an old compose file of your own, fix it before class.

## K3 · Connecting

```bash
docker compose exec db psql -U lpu -d lpudb
```

Then run the same SQL they just wrote in Colab — `\dt` to list tables, `CREATE TABLE`, `INSERT`, `SELECT`. **Same language, different engine.** That continuity is the point of the whole Colab-then-Postgres sequence.

The connection URL, which they'll paste into Python in ten minutes:

```
postgresql+psycopg://lpu:lpu@localhost:5432/lpudb
```

📌 Read it as a sentence: *driver · user · password · host · port · database.* Every database URL they ever meet has these six parts.

## K4 · SQLite vs Postgres — the differences that bite 🔵

They just learned SQL on SQLite in Colab. Be honest about what changes:

| | SQLite (the notebook) | PostgreSQL (today) |
| --- | --- | --- |
| Lives in | one file | a running server |
| Auto id | `INTEGER PRIMARY KEY` | `SERIAL` / `GENERATED … AS IDENTITY` |
| Types | suggestions, mostly | enforced |
| Concurrent writers | one | many |
| `TEXT` length limits | ignored | enforced |

📌 Say it: *"The SQL you wrote in Colab is 95% portable. The 5% is types and auto-increment — and SQLAlchemy is about to hide even that."*

---

# PART L — SQLAlchemy 2.x · 35 min 🟢

## L1 · Why an ORM 🖥️ [`l1_models_and_session.py`](../code/02_apis_and_databases/l1_models_and_session.py)

Show the two versions side by side and let it sell itself:

```python
# raw
cur.execute("SELECT id, name, branch FROM students WHERE id = %s", (student_id,))
row = cur.fetchone()
student = {"id": row[0], "name": row[1], "branch": row[2]}    # by POSITION. Add a column, break this.

# ORM
student = session.get(Student, student_id)
student.name
```

An **ORM maps a table to a class and a row to an object** — the mapping they drew in §J2, made real.

⚠️ **Be honest, and say this out loud:** an ORM is a convenience, not a replacement for SQL. When it's slow you *will* read the SQL it generated. That's exactly why SQL came first today.

## L2 · Engine, Session, and `get_db` — the critical five minutes

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "postgresql+psycopg://lpu:lpu@localhost:5432/lpudb"

engine = create_engine(DATABASE_URL, echo=True)      # echo=True prints the SQL. Teach with it ON.
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db              # <- §I2. They have seen this shape already.
    finally:
        db.close()            # <- always, even if the endpoint raised
```

- **Engine** = the connection pool. One per app, made once.
- **Session** = one unit of work. **One per request.**
- **`get_db`** = the dependency that hands a session to an endpoint and guarantees it gets closed.

💡 **AHA #7 — this is why `Depends` mattered.** Point at §I2 on the board. *"That `yield` shape you saw twenty minutes ago? This is what it was for."*

🧑‍🏫 **Leave `echo=True` on all afternoon.** Every endpoint they hit prints the SQL it generated in the terminal. Students who watch that panel stop believing the ORM is magic — they can see it's just writing the SQL they wrote in Colab an hour ago.

## L3 · Models

```python
# models.py
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

class Student(Base):
    __tablename__ = "students"

    id:     Mapped[int] = mapped_column(Integer, primary_key=True)
    name:   Mapped[str] = mapped_column(String(80), nullable=False)
    branch: Mapped[str] = mapped_column(String(10), default="CSE")
    email:  Mapped[str] = mapped_column(String(120), unique=True)
```

📌 That's **`Mapped[...]` + `mapped_column(...)`** — the SQLAlchemy **2.x** style. Anything you find online using `Column(...)` and `declarative_base()` is 1.x-era; it still runs, but don't mix the two in one codebase.

```python
Base.metadata.create_all(bind=engine)      # creates any table that doesn't exist yet
```

⚠️ **`create_all` never *changes* an existing table.** Add a column to the model and it will not appear. That's the job of a **migration tool (Alembic)** 📖 — name it, don't teach it. In class, the fix is `docker compose down -v` and start clean.

## L4 · Every route, on the database

This is the payoff. Same endpoints, same URLs, same `/docs` — different storage.

```python
@app.get("/students", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.scalars(select(Student)).all()

@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(404, f"No student with id {student_id}")
    return student

@app.post("/students", status_code=201, response_model=StudentOut)
def create_student(incoming: StudentIn, db: Session = Depends(get_db)):
    student = Student(**incoming.model_dump())
    db.add(student)
    db.commit()             # <- nothing is real until this line
    db.refresh(student)     # <- now student.id exists, because the DB assigned it
    return student
```

❓ **Ask the class:** *"Why `db.refresh()`?"*
→ Because the **database** generated the id, not Python. Before `refresh`, your object doesn't know it. Delete the line and show `id: null` coming back — that's a two-minute demo they'll remember.

📌 **`commit()` is the moment it becomes true.** Without it, the work is thrown away when the session closes.

## L5 · Getting an ORM object through a Pydantic model

```python
class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)    # read attributes, not dict keys
    id: int
    name: str
    branch: str
```

Without `from_attributes=True`, Pydantic looks for `student["name"]` and a SQLAlchemy object doesn't work that way. With it, it reads `student.name`.

💡 **AHA #8 — the restart.** Now do the thing the whole day was aiming at: `Ctrl+C`, restart the server, `GET /students`. **The data is still there.** Let that land before you say another word — this is the win condition, and it's worth a genuine pause.

## ✏️ Exercise set 2 — the ORM · 6 min

1. Add a `Course` model — `code` as the primary key, `title`, `seats`.
2. Wire `GET /courses` and `POST /courses` to the database.
3. Make `POST /courses` return **409** when the code already exists.
4. Restart the server and prove your courses survived.

---

# PART M — Relationships · 12 min 🟢 🖥️ [`m1_relationships.py`](../code/02_apis_and_databases/m1_relationships.py)

## M1 · The foreign key, in the model

**One course has many students. One student belongs to one course.** That is a **one-to-many**, and it needs exactly one new column.

```python
class Course(Base):
    __tablename__ = "courses"
    code:  Mapped[str] = mapped_column(String(10), primary_key=True)
    title: Mapped[str] = mapped_column(String(120))

    students: Mapped[list["Student"]] = relationship(back_populates="course")

class Student(Base):
    __tablename__ = "students"
    id:   Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80))

    course_code: Mapped[str | None] = mapped_column(ForeignKey("courses.code"))
    course: Mapped["Course | None"] = relationship(back_populates="students")
```

Two different things, and students merge them constantly — separate them explicitly:
- **`ForeignKey`** is a real **column in the database**. It is what actually stores the link.
- **`relationship()`** creates **no column at all**. It's Python convenience: it makes `course.students` and `student.course` work.

## M2 · Using it

```python
course = db.get(Course, "CSE101")
for student in course.students:        # SQLAlchemy runs the JOIN for you
    print(student.name)

student.course.title                   # and it works in both directions
```

💡 **AHA #9 — the promise from Module 1, paid.** Put the old slide up one last time: *"`self.courses = []` in a Python class. `course.students` on a database row. Same idea — except this one survives a restart, and the database refuses to let you point at a course that doesn't exist."*

## M3 · Returning nested data 🔵

```python
class StudentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str

class CourseWithStudents(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    title: str
    students: list[StudentBrief]        # nested, and it just works
```

📌 Module 1's nested Pydantic models were preparation for exactly this shape.

## M4 · Named, not taught 📖
- **Many-to-many** — a student taking *several* courses needs a third **association table** and `secondary=`. This is the honest real-world model; we build one-to-many today because it's one column and twenty minutes.
- **Cascades** — what happens to the students when the course is deleted.
- **`selectinload` / N+1** — why looping over 100 courses and touching `.students` can fire 101 queries.

---

## 🧪 Main build — the Course API on Postgres · 12 min

Blank folder. Statement only, no starter code:

> Build a **Course API** on Postgres with two tables. A **course** has a code, a title and a number of seats. A **student** has a name, an email and belongs to **one** course.
>
> It must support: list courses · create a course · get one course **with its students** · add a student to a course · delete a student.
> It must return **404** for a course that doesn't exist, **409** for a duplicate course code or email, and **204** from the delete.
> Structure it with `routers/`, `models.py`, `schemas.py` and `database.py`.
> Then **restart it and prove the data is still there.**

A reference implementation is in [`course_api/`](../code/02_apis_and_databases/course_api/) — don't show it until they've tried.

---

## 📝 Revision & quiz · 8 min

Ask these out loud, in this order — they retrace the whole session:

1. Path is a ____, method is a ____.
2. Which of PUT/PATCH/DELETE is not idempotent?
3. What does `exclude_unset=True` protect you from?
4. 404 vs 409 vs 422 — one sentence each.
5. What does a `yield` dependency guarantee?
6. What does a foreign key actually store?
7. Why does `db.refresh()` exist?
8. Which line makes a write real?

*(Answers, and 20 more, are in the run book's quick-check bank.)*

## 🏠 Homework

1. Finish the Course API if it isn't done.
2. Add `GET /courses/{code}/students` returning just that course's students.
3. Add a `seats_left` field computed from the number of students enrolled.
4. 📖 Read the notebook's §8 (`GROUP BY`, indexes, transactions) and run the take-home SQL sheet.

---

## 📊 Coverage map — where every topic sits

| Curriculum topic | Depth | Where |
| --- | --- | --- |
| REST API Design | 🟢 taught + built | §F |
| HTTP Methods | 🟢 taught + built | §F2, §G |
| Request & Response Models | 🟢 taught + built | §G, §L5 |
| API Validation | 🟢 taught + built | §G3, §H2 |
| Error Handling | 🟢 taught + built | §H |
| SQL Fundamentals | 🟢 taught + run in Colab | §J, notebook §2–7 |
| PostgreSQL | 🟢 taught + running | §K |
| Database Design | 🟢 taught + built | §J2, §J4, §M |
| Relationships | 🟢 taught + built (one-to-many) | §M |
| SQLAlchemy ORM | 🟢 taught + built | §L |
| Many-to-many + association tables | 📖 named | §M4 |
| Alembic migrations | 📖 named | §L3 |
| `pytest` / `TestClient` | 📖 named | homework |
| `GROUP BY`, indexes, transactions, subqueries | 📖 named + notebook §8 | §J6 |
| Async SQLAlchemy / `asyncpg` | 📖 named | §L1 |

**Nothing is dropped silently.** Every 📖 row is said out loud in class and written up above.

## 🔗 Resources *(check on the teaching day — these move)*
- FastAPI — SQL databases: https://fastapi.tiangolo.com/tutorial/sql-databases/
- SQLAlchemy 2.x ORM quick start: https://docs.sqlalchemy.org/en/20/orm/quickstart.html
- PostgreSQL Docker image (read the **18** volume note): https://hub.docker.com/_/postgres
- HTTP status codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

## ⏭️ Next module — *Auth, Docker & Deploy*
Their API now remembers things. The obvious next question is the one to leave them with:

❓ *"Anyone on the internet can `DELETE /students/1`. How does your API know who is asking?"*

Module 3: hashing and JWT, `get_current_user` — **which is `get_db` with a different body** — roles, Redis, a Dockerfile, and a public URL on their own phone.
