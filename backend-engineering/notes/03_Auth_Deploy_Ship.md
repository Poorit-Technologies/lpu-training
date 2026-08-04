# Auth, Docker & Deploy — hashing · JWT · roles · Redis · Docker · shipping it

**Module 3 of 3 · Backend** · runs locally in VS Code
**Code:** [`code/03_auth_deploy_ship/`](../code/03_auth_deploy_ship/) · **Deploy guide:** [DEPLOY.md](../DEPLOY.md) · **Setup:** [SETUP.md](../SETUP.md)

> ⚠️ **Taught in the SAME session as Module 2.** Backend runs as **two 3-hour sessions**, not three —
> Module 1, then Modules 2+3 together. These notes carry the topic in **full depth as a reference**;
> the live path is much thinner. The run book
> [`Backend_02_03_OneDay_Runbook.md`](../../trainer/runbooks/Backend_02_03_OneDay_Runbook.md) 🔒 is the
> single source for what actually gets taught, and in what order.

> **Trainer context:** their API remembers things now. The next question writes itself: *anyone on
> the internet can `DELETE /courses/CSE101` — how does it know who is asking?* Then: how does anyone
> else ever run this thing?
> **Win condition:** a padlock in `/docs` that actually works, and a public URL they can open on a phone.

**How to read the markers:**

| | Meaning |
| --- | --- |
| 🟢 | **Teach live.** In the one-day session this is the protected spine. |
| 🔵 | **Demo if time** — run it, talk over it, don't have them type it. |
| ⏭️ | **Slide-led** — named and explained on a slide, never typed. |
| 📖 | **Read at home.** Named in class in one sentence, no more. |
| 🖥️ | A file *you* run on the projector. |
| ✏️ | A task *they* do. |

## ⏱️ Where this sits in the one-day session

| Time | Section | |
| --- | --- | --- |
| 92–100 | **N.** Hashing vs encryption · what a JWT really is | 🟢 |
| 100–120 | **N.** `/register`, `/login` → token, `get_current_user`, the padlock | 🟢 ✋ hands-on |
| 120–126 | **O.** RBAC — `require_role`, and 401 vs 403 | 🔵 |
| 126–133 | **O/P.** Security checklist · Redis caching · architecture | ⏭️ |
| 133–148 | **Q.** Docker — Dockerfile, `.dockerignore`, compose | 🟢 ✋ hands-on |
| 148–164 | **R.** Deploy — *you* demo a real URL going live | 🔵 + [DEPLOY.md](../DEPLOY.md) |
| 164–172 | **S.** `POST /ask` — the Week-1 bridge | ⏭️ |
| 172–180 | Capstone brief · take-home test · close | 🟢 |

## 🎯 Objectives
By the end a student can:
- Explain why passwords are **hashed, never encrypted**, and what a salt is for.
- Read a **JWT** and say precisely what is and isn't protected about it.
- Build **`/register` and `/login`**, and protect a route with **`get_current_user`**.
- Tell **401 from 403**, and enforce a **role**.
- Name the security mistakes that actually get made, and the fix for each.
- Say what a **cache** is for and, more importantly, when not to use one.
- Write a **`Dockerfile`**, and explain why `--host 0.0.0.0` is not optional.
- Deploy the whole thing to a **public URL** by following [DEPLOY.md](../DEPLOY.md).

---

# PART N — Who is asking? · 28 min 🟢

## N1 · Hashing is not encryption 🖥️ [`n1_hashing.py`](../code/03_auth_deploy_ship/n1_hashing.py)

❓ **Ask the class first:** *"Your college portal stores your password. Should the admin be able to read it?"*
→ Most say no, then can't say how that's possible. That gap is the lesson.

**Encryption is a two-way door** — what goes in comes back out, if you hold the key.
**Hashing is a one-way door.** You never get the password back. You only ever check whether a new
attempt hashes to the same thing.

```python
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

password_hash = PasswordHash((BcryptHasher(),))

hash_1 = password_hash.hash("lpu-2026")
hash_2 = password_hash.hash("lpu-2026")     # SAME password
hash_1 != hash_2                            # -> True. Different hashes.
```

💡 **AHA #1 — same password, different hashes.** Each hash carries its own random **salt**. That's
why two students who both chose `123456` don't look identical in your table — and why an attacker
can't build one lookup table and crack the whole batch at once.

📌 Say it plainly: *"There is no `unhash()`. If a website ever emails you your old password, they
stored it in plain text — go and change that password everywhere else you used it."*

**Library note, worth 20 seconds:** we use **`pwdlib`**, which is what FastAPI's own docs use now.
The `passlib` you'll find in every older tutorial is unmaintained, and the `crypt` module it leaned
on was removed in Python 3.13. We pick **bcrypt** because that's the name you'll be asked about;
**Argon2** is the current recommendation and it's a one-line swap.

## N2 · What a JWT actually is 🖥️ [`n2_jwt.py`](../code/03_auth_deploy_ship/n2_jwt.py)

Three base64 chunks joined by dots: **`header.payload.signature`**.

```python
token = jwt.encode({"sub": "ada@lpu.in", "role": "admin", "exp": ...}, SECRET, algorithm="HS256")
```

💡 **AHA #2 — a JWT is not encrypted.** Decode the middle chunk with no secret at all and you can
read every claim. Run it live. Then:

📌 **Anyone can READ it. Nobody can CHANGE it.** Edit the payload to say `"role": "admin"` and the
signature stops matching, so `jwt.decode` refuses it. Demo that refusal — it's the moment the whole
idea lands.

⚠️ **Therefore: never put anything private in a token.** No passwords, no card numbers. Assume the
user can read it, because they can.

`exp` is checked for you — an expired token is rejected automatically.

## N3 · The login itself ✋ 🖥️ [`secure_api/`](../code/03_auth_deploy_ship/secure_api/)

Three pieces, and only the middle one is new:

```python
# auth.py
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")   # <- this makes the padlock appear

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        raise credentials_error          # tampered, expired, wrong secret - all the same answer
    user = db.scalar(select(User).where(User.email == payload.get("sub")))
    if user is None:
        raise credentials_error
    return user
```

💡 **AHA #3 — `get_current_user` is `get_db` with a different body.** Same `Depends`, same position
in the signature, same `yield`-less shape. **Nothing new was invented for auth.** Say this out loud
and point at the Module-2 slide; it turns "auth" from a scary topic into a variation they already know.

```python
@router.get("/courses")
def list_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ...          # there is no token-checking code in here at all
```

**The demo, in this exact order** — every student on their own machine:
1. `POST /auth/register` → make yourself an **admin**
2. `GET /courses` → **401**
3. Click the **padlock**, log in
4. `GET /courses` → **200**

📌 *"Same endpoint. Same you. One token later."*

⚠️ **`/auth/login` takes FORM fields, not JSON** — `OAuth2PasswordRequestForm`. That's the OAuth2
spec, not a FastAPI quirk, and it's why this one endpoint looks different. Students who curl it with
JSON get a 422 and get stuck; warn them before it happens.

📌 **One error message for both failures.** "No such user" and "wrong password" must read identically,
or you've built an **account-enumeration** leak — an attacker can discover which emails are registered.

---

# PART O — What may they do? · 13 min

## O1 · Roles 🔵

**401 is not 403.**
- **401 Unauthorized** — *"I don't know who you are."* (Badly named; it means unauthenticated.)
- **403 Forbidden** — *"I know exactly who you are, and no."*

```python
def require_role(*allowed: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise HTTPException(403, f"This needs one of these roles: {', '.join(allowed)}")
        return user
    return checker

@router.delete("/{code}", dependencies=[Depends(require_role("admin"))])
def delete_course(code: str, ...):
```

A function that *returns* a dependency, so it can be configured per route. Students find this
clever — let them.

❓ **Ask:** *"A logged-in student calls `DELETE /courses/CSE101`. Which number?"* → **403**. They're
authenticated fine; they're just not allowed.

## O2 · Security — the list that actually matters ⏭️

Slide-led. Every item is a mistake that gets made in real projects:

| Rule | Why |
| --- | --- |
| **Secrets come from the environment, never the code** | A key in git is a key on the internet. Bots scan public repos within minutes. |
| **Never log a token or a password** | Logs get shipped to third parties, pasted into tickets, and read by interns. |
| **Never return a raw exception** | Stack traces leak table names, paths and versions. |
| **HTTPS only** | A bearer token over plain HTTP is a password shouted across a café. |
| **Set CORS to real origins in production** | `*` is fine in class and wrong live. |
| **Rate-limit `/login`** | Otherwise it's an unlimited guessing machine. |
| **Same error for bad-user and bad-password** | Or you've published your user list. |
| **Short token lifetime** | A leaked token expires by itself. |

📖 **Named, not taught:** refresh tokens · OAuth social login (*"Sign in with Google"* — the same
JWT idea, with Google issuing the token) · sessions vs stateless tokens.

**Stateless vs sessions, in one line:** a **session** means the server remembers you (fast to revoke,
but every server needs the same memory). A **token** means the server remembers nothing and just
checks a signature (scales trivially, but you can't easily revoke one before it expires). *That
trade-off is the whole reason both still exist.*

---

# PART P — Making it fast · 7 min ⏭️ 🖥️ [`p1_redis_cache.py`](../code/03_auth_deploy_ship/p1_redis_cache.py)

**A cache is a small fast place you check before doing the slow thing.** That's the whole concept.

```python
cached = r.get(key)
if cached is not None:
    return cached                    # HIT  - microseconds
value = slow_lookup(code)            # MISS - a full second
r.set(key, value, ex=30)             # remember it, but only for 30 seconds
```

💡 **AHA #4 — `ex=30` is the interesting part, not `get`.** That number is a promise about how stale
you're willing to be. **Without an expiry you haven't built a cache — you've built a second database
that's quietly wrong forever.**

📌 **When NOT to cache:**
- anything **per-user and private** — serving one student another's cached page is a data breach, not a speed-up
- anything that must be **exact the instant it changes** — a seat count during registration, a bank balance

⏭️ **Architecture, in ninety seconds** (slide-led, so nobody thinks it doesn't exist): **monolith vs
microservices** — one app you can actually debug vs many you can deploy separately; you have a
monolith, and that is the correct choice for a capstone. **Message queues** — "do this later, reliably".
**CI/CD** — tests and deploys that run themselves on push. **Logging & monitoring** — how you find out
it broke *before* a user tells you.

---

# PART Q — Putting it in a box · 15 min 🟢 ✋

## Q1 · Why Docker exists

❓ **Ask:** *"Your code works. You send it to a friend. What breaks?"*
→ Python version · a missing package · a different OS · "works on my machine".

**A container is your code plus everything it needs to run, in one sealed box.** Same box on your
laptop, your friend's laptop, and a server in Singapore.

📌 They already used one — the Postgres in Module 2 was a container. *"You've been running someone
else's box all along. Now you make your own."*

## Q2 · The Dockerfile, line by line 🖥️ [`Dockerfile`](../code/03_auth_deploy_ship/Dockerfile)

```dockerfile
FROM python:3.12-slim              # 1 · a box that already has Python
WORKDIR /app                       # 2 · where our code lives inside it
COPY pyproject.toml uv.lock ./     # 3 · dependencies FIRST, on their own
RUN pip install uv && uv sync --frozen --no-dev
COPY 03_auth_deploy_ship/secure_api ./secure_api    # 5 · THEN the code
EXPOSE 8000
CMD ["uv", "run", "fastapi", "run", "secure_api/main.py", "--host", "0.0.0.0", "--port", "8000"]
```

💡 **AHA #5 — why lines 3 and 5 are separate.** Each line makes a cached **layer**. Your code changes
twenty times an hour; your dependencies change once a week. Copy them separately and a code edit
doesn't reinstall everything. Demo it: build, edit one line of Python, build again — the second is
almost instant.

⚠️ **`--host 0.0.0.0` is not optional.** `127.0.0.1` means "this machine", and inside a container
that means *the container itself* — so nothing outside can reach it. **This is the single most common
Docker mistake with FastAPI**, and the symptom is maddening: the container runs, the logs look
perfect, and nothing answers.

## Q3 · `.dockerignore` 🖥️

Two reasons, and the second one matters more:
1. **Size** — `.venv` alone can be hundreds of MB, and it's useless in the image anyway.
2. **Safety** — without it, **your `.env` with real API keys gets baked into the image** and shipped
   to anyone who pulls it.

## Q4 · Three services, one command 🖥️ [`docker-compose.yml`](../code/03_auth_deploy_ship/docker-compose.yml)

```yaml
services:
  api:    { build: ..., environment: { DATABASE_URL: postgresql+psycopg://lpu:lpu@db:5432/lpudb } }
  db:     { image: postgres:18 }
  redis:  { image: redis:8-alpine }
```

📌 **The host is `db`, not `localhost`.** Inside the compose network, service names *are* hostnames.
Students hit this instantly and it looks like magic until you say it once.

---

# PART R — Shipping it · 16 min 🔵

**You demo this on the projector; they follow at home with [DEPLOY.md](../DEPLOY.md).**

The shape, spoken while you do it:
1. Code to **GitHub** — and *"check `.env` is gitignored"* said out loud, because a leaked key is
   found by bots within minutes.
2. A **free Postgres** on Render → copy the **Internal** URL.
3. **Change `postgresql://` to `postgresql+psycopg://`.** ⚠️ The single most common first-deploy
   failure, every time.
4. A **Web Service** from the repo → it finds the Dockerfile.
5. Environment variables: `DATABASE_URL`, `SECRET_KEY` (**a new one, not the slide's**), `ALLOWED_ORIGINS`.
6. Wait for **Live**, open `/docs`, register, log in, create a course.
7. **Open it on your phone, on mobile data.**

📌 Then say it: *"That is not on my laptop. I could close this and it would keep answering."*

⚠️ Free instances **sleep after ~15 min** and take ~50 seconds to wake. Tell them before someone
reports it as a bug.

---

# PART S — The bridge · 8 min ⏭️ 🖥️ [`routers/ask.py`](../code/03_auth_deploy_ship/secure_api/routers/ask.py)

```python
@router.post("/ask")
def ask(incoming: AskIn, db: Session = Depends(get_db),
        user: User = Depends(get_current_user)):        # the SAME padlock
    context = "\n".join(f"- {c.code}: {c.title}" for c in db.scalars(select(Course)).all())
    prompt = f"Answer using ONLY this list.\n\n{context}\n\nQuestion: {incoming.question}"
```

💡 **AHA #6 — the two weeks meet, and it's an anticlimax on purpose.** Retrieve, augment, generate —
Week 1's RAG, except the context comes from *their own database* instead of a vector store. And it's
**just another endpoint**: same `Depends`, same schema, same padlock.

📌 Say it: *"An AI feature is not a different kind of software. It's an endpoint that happens to call
a model. Everything you learned this week still applies — and the AI part is ten lines of it."*

---

## 🎓 Capstone brief + take-home test · 8 min

**Capstone runs outside class**, graded against the
[Capstone Playbook](../../capstone-projects/Capstone_Playbook.md). The pitch: *"You now have every
piece. A backend with a login, a database, a public URL, and an AI endpoint. Your capstone is those
pieces pointed at a problem you care about."*

**The final test is take-home** (moved out of class when backend compressed to two sessions) — a
Google Form, open for a fixed window, covering both backend sessions.

## 🏠 Homework
1. **Follow [DEPLOY.md](../DEPLOY.md) and get your own public URL.** Put it in your capstone README.
2. Add a `student`-role user and prove `POST /courses` gives them a 403.
3. Add one more protected endpoint of your own choosing.
4. 📖 Read §O2 and find one rule your capstone currently breaks.
5. Take the final test before it closes.

---

## 📊 Coverage map

| Curriculum topic | Depth | Where |
| --- | --- | --- |
| JWT Authentication | 🟢 taught + built | §N2, §N3 |
| Authorization · RBAC | 🔵 taught + demoed | §O1 |
| Session Management | ⏭️ slide-led — stateless vs sessions, the trade-off | §O2 |
| Security Best Practices | ⏭️ slide-led, 8-rule checklist | §O2 |
| Redis Caching | ⏭️ slide-led + a runnable demo | §P |
| Backend Architecture · Microservices · Message Queues | ⏭️ named, 90 seconds | §P |
| Docker | 🟢 taught + built | §Q |
| Deployment | 🔵 demoed live + 📖 [DEPLOY.md](../DEPLOY.md) take-home | §R |
| CI/CD · Logging · Monitoring | ⏭️ named | §P |
| Refresh tokens · OAuth social login | 📖 named | §O2 |
| AI endpoint (Week-1 bridge) | ⏭️ demoed | §S |

**Nothing is dropped silently.** Every ⏭️ and 📖 row is said out loud in class and written up above.

## 🔗 Resources *(check on the teaching day — these move)*
- FastAPI security (OAuth2 + JWT): https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- PyJWT: https://pyjwt.readthedocs.io/ · pwdlib: https://frankie567.github.io/pwdlib/
- Docker's own Python guide: https://docs.docker.com/language/python/
- Render free tier: https://render.com/docs/free
- OWASP API Security Top 10: https://owasp.org/API-Security/

## ⏭️ After this
Their capstone. Everything from here is theirs — the pieces are all on the table, and the
[Capstone Playbook](../../capstone-projects/Capstone_Playbook.md) is the brief.
