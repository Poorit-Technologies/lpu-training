"""Custom rules: @field_validator (one field) and @model_validator (across fields).

Run:  uv run python 01_foundations/e3_validators.py
"""


# %%
from pydantic import BaseModel, ValidationError, field_validator, model_validator


class Signup(BaseModel):
    username: str
    password: str
    confirm_password: str
    branch: str

    # --- ONE field: runs after the type check passes ----------------------
    @field_validator("username")
    @classmethod
    def username_must_be_lowercase(cls, value: str) -> str:
        if not value.islower():
            raise ValueError("username must be lowercase")
        return value

    # A validator can also CLEAN the value instead of rejecting it.
    @field_validator("branch")
    @classmethod
    def tidy_branch(cls, value: str) -> str:
        return value.strip().upper()          # "  cse " -> "CSE"

    # --- ACROSS fields: runs once the whole object exists -----------------
    @model_validator(mode="after")
    def passwords_must_match(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self


# %%
# --- Valid, and cleaned ---------------------------------------------------
print(Signup(username="ada", password="x1", confirm_password="x1", branch="  cse "))


# %%
# --- Broken on purpose ----------------------------------------------------
def try_it(**values):
    try:
        Signup(**values)
    except ValidationError as error:
        for problem in error.errors():
            print(problem["loc"], "->", problem["msg"])


try_it(username="Ada", password="x1", confirm_password="x1", branch="cse")
try_it(username="ada", password="x1", confirm_password="x2", branch="cse")


# Why this matters: "passwords must match" is a rule about the WHOLE form,
# not about one box. field_validator cannot see the other fields; model_validator can.
