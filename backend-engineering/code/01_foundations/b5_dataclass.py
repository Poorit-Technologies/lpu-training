"""@dataclass - the same class, without the boilerplate.

Run:  uv run python 01_foundations/b5_dataclass.py
"""


# %%
from dataclasses import dataclass, field


# %%
# --- By hand ---------------------------------------------------------------
class StudentByHand:
    def __init__(self, id: int, name: str, branch: str = "CSE"):
        self.id = id
        self.name = name
        self.branch = branch

    def __repr__(self):
        return f"StudentByHand(id={self.id}, name={self.name!r}, branch={self.branch!r})"

    def __eq__(self, other):
        return (self.id, self.name, self.branch) == (other.id, other.name, other.branch)


# %%
# --- With @dataclass -------------------------------------------------------
@dataclass
class Student:
    id: int
    name: str
    branch: str = "CSE"          # __init__, __repr__ and __eq__ are written for you

    def label(self) -> str:      # your own methods still work normally
        return f"[{self.id}] {self.name} ({self.branch})"


ada = Student(1, "Ada")
print(ada)                              # Student(id=1, name='Ada', branch='CSE')
print(ada.label())
print(ada == Student(1, "Ada"))         # True - compares by value


# %%
# --- A list inside a dataclass needs field(default_factory=...) ------------
@dataclass
class Classroom:
    room: str
    students: list[str] = field(default_factory=list)   # NOT students: list = []


a = Classroom("A1")
b = Classroom("B2")
a.students.append("Ada")
print(a, "|", b)        # b is still empty - each object got its own list


# Remember this shape. In an hour you will write almost exactly this as
#     class StudentIn(BaseModel):
# and it will validate itself.
