"""Day 1 · AI — Python building blocks for AI: a class + a Pydantic model.
No API key needed.

Run:  uv run python Day01/ai/01_pydantic_classes.py
"""
from pydantic import BaseModel, ValidationError


# A small class to hold a chat session (we'll reuse this idea for LLM calls)
class ChatSession:
    def __init__(self, system: str):
        self.messages = [{"role": "system", "content": system}]

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})


chat = ChatSession("You are a helpful tutor.")
chat.add("user", "Hi!")
print("Messages so far:", chat.messages)


# A Pydantic model = the "contract" for structured data
class StudentInfo(BaseModel):
    name: str
    age: int
    interests: list[str]


good = StudentInfo(name="Ada", age=20, interests=["ai", "math"])
print("Valid:", good)

# Pydantic validates for you — wrong types are caught, not silently accepted
try:
    StudentInfo(name="Raj", age="twenty", interests=[])   # age must be int
except ValidationError as e:
    print("\nPydantic caught the bad data:")
    print(e)
