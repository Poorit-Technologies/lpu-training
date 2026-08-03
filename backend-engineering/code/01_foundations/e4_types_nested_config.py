"""Ready-made types, nested models, and locking a model down.

Run:  uv run python 01_foundations/e4_types_nested_config.py
"""


# %%
from datetime import date
from enum import Enum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, HttpUrl, ValidationError


# %%
# --- 1. Types that validate themselves ------------------------------------
class Branch(str, Enum):            # a fixed set of allowed values
    cse = "CSE"
    ece = "ECE"
    mech = "MECH"


class Profile(BaseModel):
    id: UUID
    email: EmailStr                 # needs the email-validator package
    website: HttpUrl
    joined: date
    branch: Branch
    status: Literal["active", "inactive"]    # like an Enum, written inline


profile = Profile(
    id="123e4567-e89b-12d3-a456-426614174000",
    email="ada@lpu.in",
    website="https://lpu.in",
    joined="2026-08-01",            # a string goes in, a real date comes out
    branch="CSE",
    status="active",
)
print(profile.joined, type(profile.joined))
print(profile.branch, profile.branch.value)

try:
    Profile(id=profile.id, email="not-an-email", website="https://lpu.in",
            joined="2026-08-01", branch="CSE", status="active")
except ValidationError as error:
    print("email ->", error.errors()[0]["msg"])


# %%
# --- 2. Nested models - a model inside a model ---------------------------
class Address(BaseModel):
    city: str
    pincode: str


class Student(BaseModel):
    name: str
    address: Address                # validated too, all the way down
    courses: list[str] = []


student = Student(
    name="Ada",
    address={"city": "Jalandhar", "pincode": "144411"},   # a dict becomes an Address
    courses=["CS101"],
)
print(student.address.city, type(student.address))
print(student.model_dump())         # nesting survives the round trip


# %%
# --- 3. Locking the model down --------------------------------------------
class StrictStudent(BaseModel):
    model_config = ConfigDict(
        extra="forbid",             # reject fields you did not ask for
        str_strip_whitespace=True,  # trim every string automatically
    )

    name: str


print(StrictStudent(name="  Ada  "))          # name='Ada' - trimmed

try:
    StrictStudent(name="Ada", is_admin=True)  # a field nobody declared
except ValidationError as error:
    print("extra ->", error.errors()[0]["msg"])

# Without extra="forbid", is_admin would be silently ignored - and a typo in
# a field name would silently do nothing at all.
