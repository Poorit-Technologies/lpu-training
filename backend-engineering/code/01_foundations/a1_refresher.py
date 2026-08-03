"""Python refresher - the bits a backend actually uses.

Run:  uv run python 01_foundations/a1_refresher.py
"""


# %%
# --- 1. Variables and f-strings -------------------------------------------
name = "Ada"
age = 20
print(f"{name} is {age} years old")


# %%
# --- 2. The four collections, and when to use which ------------------------
marks = [90, 85, 77]                       # list  - ordered, changeable
point = (12, 5)                            # tuple - ordered, FIXED
student = {"name": "Ada", "branch": "CSE"}  # dict  - labelled data  <- the big one
branches = {"CSE", "ECE", "CSE"}           # set   - no duplicates

print(marks[0], point[0], student["name"], branches)

# A dict is how data travels in a backend. Remember this shape.
print(student["branch"])
print(student.get("age", "not given"))     # .get() never crashes on a missing key


# %%
# --- 3. Deciding and repeating --------------------------------------------
if age >= 18:
    print("adult")
else:
    print("minor")

for mark in marks:
    print("mark:", mark)

total = 0
while total < 100:
    total += 50
print("total:", total)


# %%
# --- 4. Functions ----------------------------------------------------------
def average(numbers: list[int]) -> float:      # type hints: what goes in, what comes out
    return sum(numbers) / len(numbers)


def greet(name: str, greeting: str = "Hi") -> str:   # default argument
    return f"{greeting} {name}"


print(average(marks))
print(greet("Ada"))
print(greet("Ada", greeting="Welcome"))        # keyword argument


# %%
# --- 5. Comprehensions - build a list in one line --------------------------
squares = [n * n for n in marks]
toppers = [m for m in marks if m > 80]         # with a filter
print(squares, toppers)


# %%
# --- 6. Three gotchas worth knowing ----------------------------------------
print(4 / 2)        # 2.0   - division ALWAYS gives a float
print(4 // 2)       # 2     - use // when you want a whole number

a = [1, 2]
b = [1, 2]
print(a == b)       # True  - same contents
print(a is b)       # False - not the same object in memory


def add_item(item, basket=None):
    # DON'T write basket=[] - Python creates that list ONCE and reuses it forever
    if basket is None:
        basket = []
    basket.append(item)
    return basket


print(add_item("pen"), add_item("book"))       # ['pen'] ['book'] - fresh each time
