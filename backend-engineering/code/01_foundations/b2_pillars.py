"""The 4 pillars of OOP - one small example each, in backend language.

Run:  uv run python 01_foundations/b2_pillars.py
"""


# %%
# =========================================================================
# 1) ENCAPSULATION - keep the data and the rule that protects it together.
# =========================================================================
class BankAccount:
    def __init__(self):
        self._balance = 0                     # the _ means "internal, hands off"

    def deposit(self, amount: int):
        if amount <= 0:
            raise ValueError("amount must be positive")   # the rule lives HERE
        self._balance += amount

    def balance(self) -> int:
        return self._balance


account = BankAccount()
account.deposit(500)
print("Balance:", account.balance())          # Balance: 500

try:
    account.deposit(-100)
except ValueError as error:
    print("refused:", error)


# %%
# =========================================================================
# 2) INHERITANCE - a child class reuses its parent.
# =========================================================================
class User:
    def __init__(self, name: str):
        self.name = name

    def role(self) -> str:
        return "user"

    def describe(self) -> str:
        return f"{self.name} -> role: {self.role()}"


class Admin(User):
    def __init__(self, name: str, level: int):
        super().__init__(name)         # super() = "run the parent's version first"
        self.level = level             # then add what is new

    def role(self) -> str:             # same method name, different answer
        return "admin"


print(User("Ada").describe())          # Ada -> role: user
print(Admin("Raj", 2).describe())      # Raj -> role: admin   <- describe() came from User


# %%
# =========================================================================
# 3) POLYMORPHISM - same method name, different behaviour behind it.
# =========================================================================
class EmailNotifier:
    def send(self, message: str) -> str:
        return f"EMAIL: {message}"


class SMSNotifier:
    def send(self, message: str) -> str:
        return f"SMS: {message}"


notifier = EmailNotifier()      # <- change to SMSNotifier() and run again
print(notifier.send("Your marks are out"))
# The calling line never changes. That is the whole point.


# %%
# =========================================================================
# 4) ABSTRACTION - show WHAT it does, hide HOW it does it.
# =========================================================================
class Database:
    def save(self, student: str) -> str:
        row = self._format(student)
        return self._write_to_disk(row)       # the caller sees none of this

    def _format(self, student: str) -> str:
        return student.strip().title()

    def _write_to_disk(self, row: str) -> str:
        return f"saved {row}"


print(Database().save("  ada  "))             # saved Ada
