"""Module 3 · N — what a JWT actually is.

A JWT is not encrypted. It is three base64 chunks joined by dots:
    header . payload . signature

Anyone can READ the payload. Nobody can CHANGE it without your secret, because
the signature would stop matching. That distinction is the whole lesson.

Run:  uv run python 03_auth_deploy_ship/n2_jwt.py
"""
import base64
import json
from datetime import datetime, timedelta, timezone

import jwt          # the PyJWT package

# HS256 signs with SHA-256, so the key must be at least 32 bytes - a shorter one
# weakens the signature, and PyJWT warns about it. In a real app: an env var.
SECRET = "change-me-in-production-min-32-bytes-long"
ALGORITHM = "HS256"

payload = {
    "sub": "ada@lpu.in",                              # who this token is about
    "role": "admin",
    "exp": datetime.now(timezone.utc) + timedelta(minutes=30),   # when it dies
}

token = jwt.encode(payload, SECRET, algorithm=ALGORITHM)
print("The token:\n", token, "\n")

header_b64, payload_b64, signature_b64 = token.split(".")
print("It is three parts joined by dots:")
print("  header   :", header_b64)
print("  payload  :", payload_b64)
print("  signature:", signature_b64)
print()

# NOT encrypted - anyone holding the token can read this, no secret needed.
def b64(chunk: str) -> dict:
    return json.loads(base64.urlsafe_b64decode(chunk + "=" * (-len(chunk) % 4)))

print("Anyone can decode the payload WITHOUT the secret:")
print(" ", b64(payload_b64))
print("So never put anything private in a token. No passwords, no card numbers.")
print()

# Decoding WITH the secret is what proves it was not tampered with.
print("Decoding with the secret (this VERIFIES the signature):")
print(" ", jwt.decode(token, SECRET, algorithms=[ALGORITHM]))
print()

# Tamper with it: flip the role to admin and the signature no longer matches.
tampered_payload = base64.urlsafe_b64encode(
    json.dumps({"sub": "attacker@lpu.in", "role": "admin"}).encode()
).decode().rstrip("=")
tampered = f"{header_b64}.{tampered_payload}.{signature_b64}"

print("Now an attacker edits the payload to make themselves an admin:")
try:
    jwt.decode(tampered, SECRET, algorithms=[ALGORITHM])
    print("  ...it worked?! (it should not)")
except jwt.InvalidTokenError as exc:
    print(f"  rejected: {type(exc).__name__}")
    print("  The payload changed, so the signature no longer matches. THAT is the point:")
    print("  the token is readable but not forgeable.")
print()

expired = jwt.encode(
    {"sub": "ada@lpu.in", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)},
    SECRET, algorithm=ALGORITHM,
)
try:
    jwt.decode(expired, SECRET, algorithms=[ALGORITHM])
except jwt.ExpiredSignatureError:
    print("An expired token is rejected automatically - `exp` is checked for you.")
