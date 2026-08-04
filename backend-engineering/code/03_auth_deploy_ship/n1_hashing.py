"""Module 3 · N — hashing is not encryption.

Encryption is a two-way door: what goes in can come back out, if you hold the key.
Hashing is a one-way door. You NEVER get the password back — you only ever check
whether a new attempt hashes to the same thing.

Run:  uv run python 03_auth_deploy_ship/n1_hashing.py
"""
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

# pwdlib is what FastAPI's own docs use now. passlib is unmaintained, and the
# `crypt` module it leaned on was removed in Python 3.13.
#
# We pick bcrypt explicitly because that is the name you will be asked about in
# an interview. Argon2 is the current recommendation - swap this one line for
# PasswordHash.recommended() (and install pwdlib[argon2]) and nothing else changes.
password_hash = PasswordHash((BcryptHasher(),))

secret = "lpu-2026"

hash_1 = password_hash.hash(secret)
hash_2 = password_hash.hash(secret)

print("password :", secret)
print("hash #1  :", hash_1)
print("hash #2  :", hash_2)
print()
print("Same password, two DIFFERENT hashes:", hash_1 != hash_2)
print("...because each hash carries its own random SALT.")
print("That is why two students with the password '123456' do not look identical")
print("in your database - and why an attacker cannot build one table and crack everyone.")
print()

# Verification does not decrypt anything. It hashes the attempt with the SAME
# salt (which is stored inside the hash string) and compares the results.
print("verify correct password :", password_hash.verify("lpu-2026", hash_1))
print("verify wrong password   :", password_hash.verify("lpu-2027", hash_1))
print()
print("Notice what is NOT possible: there is no unhash(). If a student asks how")
print("a site emails you your old password back - it means they stored it in plain")
print("text, and you should change that password everywhere else you used it.")
