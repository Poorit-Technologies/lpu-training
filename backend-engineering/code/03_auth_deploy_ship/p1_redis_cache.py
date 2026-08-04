"""Module 3 · P — caching, and when NOT to.

A cache is a small fast place you check before doing the slow thing. That is all.
The hard part is never the cache; it is knowing when the cached answer is a lie.

Before running:  docker compose -f 03_auth_deploy_ship/docker-compose.yml up -d redis
Run:             uv run python 03_auth_deploy_ship/p1_redis_cache.py
"""
import os
import time

import redis

r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)


def slow_lookup(code: str) -> str:
    """Pretend this is a heavy database query, or somebody else's slow API."""
    time.sleep(1.0)
    return f"{code}: Intro to Backend, 60 seats"


def get_course(code: str) -> tuple[str, str]:
    key = f"course:{code}"

    cached = r.get(key)                       # 1 · check the fast place first
    if cached is not None:
        return cached, "CACHE"

    value = slow_lookup(code)                 # 2 · miss - do the slow thing
    r.set(key, value, ex=30)                  # 3 · remember it, but only for 30s
    return value, "SLOW"


r.delete("course:CSE101")

for attempt in (1, 2):
    started = time.perf_counter()
    value, source = get_course("CSE101")
    print(f"call {attempt}: {source:5}  {time.perf_counter() - started:.3f}s   {value}")

print()
print("Same answer, ~1000x faster. The first call paid; the second did not.")
print()
print("--- the part everyone skips ---")
print("ex=30 means this answer EXPIRES after 30 seconds. That number is a promise")
print("about how stale you are willing to be. Without it, you have not built a")
print("cache - you have built a second database that is quietly wrong forever.")
print()
print("Now update the course and read it again:")
r.set("course:CSE101", "CSE101: Intro to Backend, 59 seats", ex=30)   # invalidate on write
print(" ", get_course("CSE101")[0])
print()
print("DO cache: things read constantly and changed rarely - course lists, config.")
print("DO NOT cache: anything per-user and private, or anything that must be exact")
print("              the instant it changes - a seat count during registration,")
print("              a bank balance. Serving one student another student's cached")
print("              page is a data breach, not a performance win.")
