"""Type hints - the single most important Python feature for this course.

Run:  uv run python 01_foundations/a2_type_hints.py
"""


# %%
# A hint says what a value is SUPPOSED to be.
def double(n: int) -> int:
    return n * 2


print(double(5))


# Python does NOT enforce hints. This runs, and gives nonsense:
print(double("ab"))        # abab  <- no error, no complaint


# So why bother?
#   1. Your editor autocompletes and warns you.
#   2. Other people read them as documentation.
#   3. FastAPI READS them and turns them into real validation.
# That third one is why this course cares. Same hint, enforced for free.


# %%
# --- The hints you will use all week --------------------------------------
def totals(marks: list[int]) -> int:
    return sum(marks)


def label(student: dict[str, str]) -> str:
    return f"{student['name']} ({student['branch']})"


def find(name: str) -> str | None:      # "a string, OR nothing at all"
    return None if name == "" else name


print(totals([90, 85]))
print(label({"name": "Ada", "branch": "CSE"}))
print(find(""), "|", find("Ada"))


# %%
# --- Where hints become validation ----------------------------------------
# In an hour you will write this:
#
#     @app.get("/students/{student_id}")
#     def get_student(student_id: int):
#         ...
#
# and "abc" will be rejected with a clear error, automatically,
# because of that one word: int.
