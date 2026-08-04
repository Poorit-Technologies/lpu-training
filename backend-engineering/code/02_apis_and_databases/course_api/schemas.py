"""The API shapes — what we accept, and what we return.

model_config = ConfigDict(from_attributes=True) is what lets Pydantic read a
SQLAlchemy object (student.name) instead of a dict (student["name"]).
"""
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── in ────────────────────────────────────────────────────────────────────
class CourseIn(BaseModel):
    code: str = Field(min_length=3, max_length=10)
    title: str = Field(min_length=3, max_length=120)
    seats: int = Field(default=60, ge=1, le=500)


class StudentIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    course_code: str | None = None


# ── out ───────────────────────────────────────────────────────────────────
class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    course_code: str | None


class StudentBrief(BaseModel):
    """Just enough of a student to list inside a course."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    title: str
    seats: int


class CourseWithStudents(CourseOut):
    """Nested output — Pydantic walks course.students for you."""
    students: list[StudentBrief]
