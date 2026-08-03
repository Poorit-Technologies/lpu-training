"""Errors you raise on purpose, and JSON - how data travels.

Run:  uv run python 01_foundations/a3_errors_and_json.py
"""


# %%
import json


# %%
# --- 1. try / except - handle a problem instead of crashing ----------------
try:
    age = int("hello")
except ValueError:
    print("that was not a number")


# %%
# --- 2. raise - refuse bad input on purpose --------------------------------
def set_age(age: int) -> int:
    if age < 0:
        raise ValueError("age cannot be negative")
    return age


try:
    set_age(-5)
except ValueError as error:
    print("refused:", error)

# This is exactly what a backend does all day: check, and refuse clearly.
# In FastAPI the same idea has an API-shaped version: raise HTTPException(404).


# %%
# --- 3. finally - runs whether it worked or not ----------------------------
try:
    number = int("42")
except ValueError:
    number = 0
finally:
    print("checked the input, moving on ->", number)


# %%
# --- 4. JSON - a dict, with different punctuation --------------------------
student = {"name": "Ada", "branch": "CSE", "age": 20, "active": True}

as_text = json.dumps(student)          # Python dict  -> JSON text
print(as_text)
print(type(as_text))                   # <class 'str'> - it is TEXT now

back_again = json.loads(as_text)       # JSON text -> Python dict
print(back_again["name"], type(back_again))

# Spot the differences: True became true, and single quotes became double.
# JSON is the format every API on the internet speaks.
# Good news: FastAPI does both conversions for you. You just return a dict.
