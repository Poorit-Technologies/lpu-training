"""Pydantic basics - a class that checks itself.

Run:  uv run python 01_foundations/e1_basics.py
"""


# %%
from pydantic import BaseModel, ValidationError


class Student(BaseModel):
    name: str                 # required - no default
    age: int                  # required
    branch: str = "CSE"       # optional - has a default
    email: str | None = None  # optional - may genuinely be nothing


# %%
# --- 1. The happy path -----------------------------------------------------
ada = Student(name="Ada", age=20)
print(ada)


# %%
# --- 2. Coercion - Pydantic converts when it safely can --------------------
raj = Student(name="Raj", age="21")        # a STRING went in...
print(raj.age, type(raj.age))              # 21 <class 'int'>  ...an int came out


# %%
# --- 3. Rejection - when it cannot convert, it refuses --------------------
try:
    Student(name="Meera", age="hello")
except ValidationError as error:
    print(error)


# %%
# --- 4. The error is data, not just a message -----------------------------
try:
    Student(age="hello")                   # two problems: name missing, age bad
except ValidationError as error:
    for problem in error.errors():
        print(problem["loc"], "->", problem["msg"])

# This structure is exactly what your API sends back as a 422.


# %%
# --- 5. Getting data back out ---------------------------------------------
print(ada.model_dump())          # -> a plain dict
print(ada.model_dump_json())     # -> a JSON string

# ...and going the other way, from data you received:
incoming = {"name": "Meera", "age": 19, "branch": "ECE"}
print(Student.model_validate(incoming))
