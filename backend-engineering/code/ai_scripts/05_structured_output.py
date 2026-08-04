"""GenAI in plain Python — turn an LLM's answer into a validated Pydantic object.

Run:    uv run python ai_scripts/05_structured_output.py
Needs:  OPENAI_API_KEY in your .env
"""
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()


class Recipe(BaseModel):
    title: str
    ingredients: list[str]
    minutes: int


client = OpenAI()

resp = client.chat.completions.create(
    model="gpt-5.6",              # change to a current model id if needed
    messages=[{
        "role": "user",
        "content": (
            "Give a simple pasta recipe as JSON with keys: "
            "title (str), ingredients (list of str), minutes (int)."
        ),
    }],
    response_format={"type": "json_object"},
)

# The model returns text -> validate it into a typed object we can trust
recipe = Recipe.model_validate_json(resp.choices[0].message.content)

print("Title:      ", recipe.title)
print("Minutes:    ", recipe.minutes)
print("Ingredients:", ", ".join(recipe.ingredients))
