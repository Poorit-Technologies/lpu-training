"""The API shapes. Note what is missing from every Out model: the password."""
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="At least 8 characters")
    role: str = Field(default="student", pattern="^(student|admin)$")


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str
    # hashed_password is deliberately absent. response_model drops it on the way
    # out even if a careless endpoint returns the whole ORM object.


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"      # the shape OAuth2 clients (and /docs) expect


class CourseIn(BaseModel):
    code: str = Field(min_length=3, max_length=10)
    title: str = Field(min_length=3, max_length=120)
    seats: int = Field(default=60, ge=1, le=500)


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    title: str
    seats: int


class AskIn(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class AskOut(BaseModel):
    question: str
    answer: str
    grounded: bool
