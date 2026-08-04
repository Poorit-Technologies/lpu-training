# 🚀 Deploy Guide — put your API on the internet

**Do this at home, after the session.** You watched it happen live in class; this is the same
thing, at your own pace, with your own app. Budget **30–45 minutes** for your first one.

At the end you will have a URL like `https://your-course-api.onrender.com/docs` that works on
**any phone, on any network**. Send it to someone. That is the point.

> **Everything here uses free tiers.** No card. The one catch is that a free service **sleeps
> after ~15 minutes of no traffic** and takes ~50 seconds to wake up — so if your link seems
> dead, wait a minute and refresh.

---

## What you need

- A **GitHub** account — https://github.com/signup
- A **Render** account — https://render.com (sign in *with GitHub*, it saves a step)
- Your Module 3 code running locally, in a folder you can push

---

## 1 · Get your code onto GitHub

From your `code/` folder:

```bash
git init -b main
```

```bash
git add . && git commit -m "My course API"
```

> ⚠️ **Before you push, open `.gitignore` and make sure `.env` is in it.** Pushing an API key to a
> public repo means bots find it within minutes — this genuinely happens, every day. If you have
> already pushed one, the key is burned: go to the provider and revoke it.

Create an empty repo on GitHub (**no** README, **no** .gitignore), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
```

```bash
git push -u origin main
```

---

## 2 · Create the database first

The API needs somewhere to point at, so the database comes first.

1. Render dashboard → **New +** → **Postgres**
2. Name it `course-db`, pick the **free** instance type, choose the region closest to you
3. Create it, and wait for **Available** (a minute or two)
4. Open it and copy the **Internal Database URL**

It looks like `postgresql://user:pass@host/dbname`. **Change the beginning** so SQLAlchemy knows
which driver to use:

```
postgresql+psycopg://user:pass@host/dbname
```

> That one edit is the single most common reason a first deploy fails. `postgresql://` alone makes
> SQLAlchemy reach for a driver that is not installed.

---

## 3 · Create the web service

1. **New +** → **Web Service** → connect your GitHub repo
2. Render will spot your `Dockerfile`. If it asks, choose **Docker** as the runtime.
3. Set **Dockerfile Path** to `03_auth_deploy_ship/Dockerfile` and **Docker Build Context** to `.`
4. Instance type: **Free**

Then add the environment variables — this is the part that matters:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | the Internal URL from step 2, **with `+psycopg`** |
| `SECRET_KEY` | a long random string you invent. **Not** the one from the slides. |
| `ALLOWED_ORIGINS` | `*` for now |

Click **Create Web Service** and watch the log. The first build takes 3–5 minutes.

---

## 4 · Prove it works

When the log says **Live**, open your URL and add `/docs`:

```
https://your-service.onrender.com/docs
```

Then, in this order:

1. `POST /auth/register` — make yourself an `admin`
2. Click the **padlock** and log in
3. `POST /courses` — add a course
4. **Open the same URL on your phone, on mobile data, not Wi-Fi**

That last step is the one. It is not on your laptop any more.

---

## When it goes wrong

| What you see | What it means |
| --- | --- |
| Build fails: `Dockerfile not found` | The Dockerfile Path or the Build Context is wrong. Context should be the folder holding `pyproject.toml`. |
| `Can't load plugin: sqlalchemy.dialects:postgres` | You used the URL exactly as Render gave it. Add `+psycopg`. |
| Deploy succeeds, then the service restarts forever | The app crashed on boot. Read the log from the **top**, not the bottom — the first error is the real one. |
| `connection refused` to the database | You used the **External** URL. Use the **Internal** one — both services are on Render. |
| Everything 500s, and the log mentions a table | The tables were never created. `create_all` runs at startup, so check the boot log for a database error above it. |
| The URL loads, but every login fails after a redeploy | You did not set `SECRET_KEY`, so it changed on restart and every old token is now invalid. |
| First request takes ~50 seconds | The free instance was asleep. Normal. Not your bug. |

---

## What you have actually done

Say this out loud, because it is worth noticing:

> You wrote a Python class. It became an API. The API got a database, then a login, then roles.
> You put the whole thing in a box, and the box now runs on a computer you have never seen,
> answering anyone in the world.

That URL is what goes in your CV, and it is the thing to demo in an interview — not the code.

**Next:** point your capstone frontend at it, and put the URL in your project README.
