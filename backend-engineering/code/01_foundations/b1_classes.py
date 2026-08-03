"""Classes and objects - the one idea everything else sits on.

Run:  uv run python 01_foundations/b1_classes.py
"""


# %%
# A class is a BLUEPRINT. It says what every Student has, and what it can do.
class Student:
    college = "LPU"           # CLASS attribute - shared by every student

    def __init__(self, id: int, name: str, branch: str = "CSE"):
        # INSTANCE attributes - each object gets its own copy
        self.id = id
        self.name = name
        self.branch = branch

    def label(self) -> str:                      # a method = a function inside a class
        return f"[{self.id}] {self.name} ({self.branch})"


# One blueprint -> as many objects as you want.
ada = Student(1, "Ada")
raj = Student(2, "Raj", "ECE")

print(ada.label())          # [1] Ada (CSE)
print(raj.label())          # [2] Raj (ECE)


# %%
# --- self ------------------------------------------------------------------
# self is just "the object this method was called on".
# ada.label() quietly passes ada in as self. Proof:
print(Student.label(ada))   # exactly the same output


# %%
# --- instance vs class attributes ------------------------------------------
print(ada.college, raj.college)     # LPU LPU - both read the same shared value

ada.name = "Ada Lovelace"           # changing an INSTANCE attribute...
print(ada.name, "|", raj.name)      # ...only affects ada

Student.college = "LPU Jalandhar"   # changing the CLASS attribute...
print(ada.college, "|", raj.college)  # ...affects everyone
