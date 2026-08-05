# Module 3 — Auth, Docker & Deploy

Hashing · JWT · roles · security · Redis · Docker · a public URL.
Notes: [`../../notes/03_Auth_Deploy_Ship.md`](../../notes/03_Auth_Deploy_Ship.md) ·
Deploy guide: [`../../DEPLOY.md`](../../DEPLOY.md)

Run everything from the `code/` folder (one level up).

## 0 · Start the backing services

```bash
docker compose -f 03_auth_deploy_ship/docker-compose.yml up -d db redis
```

## 1 · The two ideas, on their own — no database needed

```bash
uv run python 03_auth_deploy_ship/n1_hashing.py    # hashing is a ONE-WAY door
uv run python 03_auth_deploy_ship/n2_jwt.py        # a JWT is readable but not forgeable
```

## 2 · The app

```bash
uv run fastapi dev 03_auth_deploy_ship/secure_api/main.py
```

Then at **http://127.0.0.1:8000/docs**, in this order:

1. `POST /auth/register` — `{"email": "ada@lpu.in", "password": "lpu-2026-ok", "role": "admin"}`
2. `GET /courses` → **401**. You are not logged in.
3. Click the **padlock**, log in with that email and password.
4. `GET /courses` → **200**. Same endpoint, same you, one token later.
5. Register a second user with `"role": "student"`, log in as them, `POST /courses` → **403**.

## 3 · Caching

```bash
uv run python 03_auth_deploy_ship/p1_redis_cache.py
```

## 4 · Docker — the API itself in a box

```bash
docker build -f 03_auth_deploy_ship/Dockerfile -t course-api .
```

```bash
docker compose -f 03_auth_deploy_ship/docker-compose.yml up --build
```

The second one runs all three services together — API, Postgres, Redis — and the API now
reaches the database at `db:5432`, not `localhost`.

## 5 · CI — the checks that run themselves

[`r1_github_actions_ci.yml`](r1_github_actions_ci.yml) is a **commented tutorial** — read it top to
bottom and you have GitHub Actions. It is also a working workflow: copy it into your capstone repo at
`.github/workflows/ci.yml`, push, and watch the Actions tab.

```bash
cat 03_auth_deploy_ship/r1_github_actions_ci.yml
```

Nothing to run here — the file only becomes live once it sits in `.github/workflows/` of a repo you
own. It checks that every file parses, that the dependencies resolve, and that the Docker image still
builds. Both check commands are verified against this project.

## What runs where

| | Where | Needs |
| --- | --- | --- |
| Hashing · JWT | here, plain Python | `uv sync` |
| The secure API | here, in VS Code | `uv sync` + Postgres running |
| Redis caching | here | Redis running |
| Docker | here | Docker Desktop |
| CI (GitHub Actions) | [`r1_github_actions_ci.yml`](r1_github_actions_ci.yml) - read it, then copy it into your own repo | a GitHub account |
| Deploying it | [DEPLOY.md](../../DEPLOY.md), at home | a GitHub account |

## When it goes wrong

| Problem | Fix |
| --- | --- |
| `401` on every route right after logging in | You clicked the padlock but did not press **Authorize**, or the token expired (30 min). Log in again. |
| `403` where you expected `401` | That is correct and deliberate. 401 = I don't know you. 403 = I know you, and no. |
| `/auth/login` returns `422` | It takes **form** fields, not JSON — that is the OAuth2 spec. Use the padlock, or `-d` not `-H 'Content-Type: application/json'`. |
| Container starts, but nothing answers on 8000 | Missing `--host 0.0.0.0`. Inside a container, `127.0.0.1` means the container itself. |
| `connection refused` to the DB from inside the container | The host is `db`, not `localhost` — that is the compose service name. |
| Image is enormous | `.dockerignore` is missing or not next to the build context. `.venv` alone can be hundreds of MB. |
| `docker compose up --build` rebuilds everything every time | You edited `pyproject.toml`. Editing only `secure_api/` should reuse the cached install layer. |
