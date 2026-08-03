"""Dunder methods and @property - making your classes behave like built-ins.

Run:  uv run python 01_foundations/b3_dunders_and_property.py
"""


# %%
# --- Without dunders -------------------------------------------------------
class Plain:
    def __init__(self, name: str):
        self.name = name


print(Plain("Ada"))                 # <__main__.Plain object at 0x...>  - useless
print(Plain("Ada") == Plain("Ada"))  # False - two different objects in memory


# %%
# --- With dunders ("double underscore" methods Python calls for you) --------
class Student:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

    def __str__(self) -> str:              # what print() shows
        return f"{self.name} (#{self.id})"

    def __repr__(self) -> str:             # what the debugger / a list shows
        return f"Student(id={self.id}, name={self.name!r})"

    def __eq__(self, other) -> bool:       # what == means for this class
        return self.id == other.id


ada = Student(1, "Ada")
print(ada)                                 # Ada (#1)
print([ada])                               # [Student(id=1, name='Ada')]  <- __repr__
print(ada == Student(1, "Ada"))            # True - same id, so "the same student"

# @dataclass writes __init__, __repr__ and __eq__ for you. Now you know what it wrote.


# %%
# --- @property - a method that behaves like an attribute -------------------
class Circle:
    def __init__(self, radius: float):
        self.radius = radius

    @property
    def area(self) -> float:               # no () when you use it
        return 3.14159 * self.radius ** 2


circle = Circle(2)
print(circle.area)                         # 12.56636  - looks like data, is code


# %%
# --- @property + setter - encapsulation, the Python way --------------------
class Account:
    def __init__(self):
        self._balance = 0

    @property
    def balance(self) -> int:
        return self._balance

    @balance.setter
    def balance(self, amount: int):
        if amount < 0:
            raise ValueError("balance cannot be negative")   # guarded assignment
        self._balance = amount


account = Account()
account.balance = 500                      # goes through the setter
print(account.balance)

try:
    account.balance = -100                 # ...and the rule still applies
except ValueError as error:
    print("refused:", error)
