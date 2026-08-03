"""Field() - putting real rules on each field.

Run:  uv run python 01_foundations/e2_field_constraints.py
"""


# %%
from pydantic import BaseModel, Field, ValidationError


class Student(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=50,
        description="Full name",          # shows up in /docs
        examples=["Ada Lovelace"],
    )
    age: int = Field(ge=16, le=100)       # ge = at least, le = at most
    cgpa: float = Field(gt=0, lt=10)      # gt = strictly more, lt = strictly less
    roll_no: str = Field(pattern=r"^\d{8}$")   # exactly 8 digits
    branch: str = "CSE"


# The numbers, in words:
#   gt  >   greater than         lt  <   less than
#   ge  >=  greater or equal     le  <=  less or equal


# %%
# --- Valid ----------------------------------------------------------------
print(Student(name="Ada", age=20, cgpa=9.1, roll_no="12345678"))


# %%
# --- Each rule, broken on purpose -----------------------------------------
def try_it(**values):
    try:
        Student(**values)
    except ValidationError as error:
        for problem in error.errors():
            print(problem["loc"][0], "->", problem["msg"])


try_it(name="A", age=20, cgpa=9.1, roll_no="12345678")           # name too short
try_it(name="Ada", age=12, cgpa=9.1, roll_no="12345678")         # too young
try_it(name="Ada", age=20, cgpa=11.0, roll_no="12345678")        # cgpa out of range
try_it(name="Ada", age=20, cgpa=9.1, roll_no="ABC")              # roll_no wrong shape

# Every one of these rules also appears in /docs, automatically.
