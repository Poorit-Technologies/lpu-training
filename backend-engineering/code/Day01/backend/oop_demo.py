"""Day 1 · Backend — OOP essentials (runnable, no server, no API key).

Run:  uv run python Day01/backend/oop_demo.py
"""
from dataclasses import dataclass


# 1) A class = blueprint; objects = instances
class Student:
    def __init__(self, id: int, name: str, branch: str = "CSE"):
        self.id = id
        self.name = name
        self.branch = branch

    def label(self) -> str:
        return f"[{self.id}] {self.name} ({self.branch})"


ada = Student(1, "Ada")
raj = Student(2, "Raj", "ECE")
print(ada.label())          # [1] Ada (CSE)
print(raj.label())          # [2] Raj (ECE)


# 2) Encapsulation — bundle data + rules, guard the internals
class BankAccount:
    def __init__(self):
        self.__balance = 0                     # "private" (name-mangled)

    def deposit(self, amount: int):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.__balance += amount

    def balance(self) -> int:
        return self.__balance


acc = BankAccount()
acc.deposit(500)
print("Balance:", acc.balance())               # Balance: 500


# 3) dataclass — same idea, zero boilerplate
@dataclass
class Book:
    id: int
    title: str
    author: str

    def citation(self) -> str:
        return f"{self.title} — {self.author}"


print(Book(1, "Clean Code", "Robert Martin").citation())
