"""schemas.py - the SHAPES of data going in and out. Pydantic models only."""
from pydantic import BaseModel


class StudentIn(BaseModel):
    name: str
    branch: str = "CSE"


class StudentOut(BaseModel):
    id: int
    name: str
    branch: str
