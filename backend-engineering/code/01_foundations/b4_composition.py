"""Composition vs inheritance, and abstract base classes.

Run:  uv run python 01_foundations/b4_composition.py
"""


# %%
from abc import ABC, abstractmethod


# =========================================================================
# INHERITANCE is "IS-A".      Admin IS A User.
# COMPOSITION is "HAS-A".     Student HAS courses.
# =========================================================================
class Course:
    def __init__(self, code: str, title: str):
        self.code = code
        self.title = title

    def __repr__(self) -> str:
        return f"{self.code}"


class Student:
    def __init__(self, name: str):
        self.name = name
        self.courses: list[Course] = []      # HAS-A: a student holds courses

    def enroll(self, course: Course):
        self.courses.append(course)


ada = Student("Ada")
ada.enroll(Course("CS101", "Databases"))
ada.enroll(Course("CS102", "Networks"))
print(ada.name, "->", ada.courses)           # Ada -> [CS101, CS102]

# A Student is NOT a Course, so inheritance would be wrong here.
# Ask "is-a or has-a?" every time. Most real modelling is has-a.
# Remember this shape - a database calls it a RELATIONSHIP.


# %%
# =========================================================================
# ABSTRACT BASE CLASS - a contract that says "every child MUST have this"
# =========================================================================
class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> str:
        ...                                  # no body - children must write it


class EmailNotifier(Notifier):
    def send(self, message: str) -> str:
        return f"EMAIL: {message}"


print(EmailNotifier().send("Marks are out"))

# Forget to write send(), and Python refuses to even create the object:
class BrokenNotifier(Notifier):
    pass


try:
    BrokenNotifier()
except TypeError as error:
    print("refused:", error)
