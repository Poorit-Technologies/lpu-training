"""Day 1 · AI — call OpenAI with the official client.

Run:    uv run python Day01/ai/02_openai_call.py
Needs:  OPENAI_API_KEY in your .env
"""
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()                     # reads keys from .env

client = OpenAI()                 # picks up OPENAI_API_KEY automatically

resp = client.chat.completions.create(
    model="gpt-5.6",              # change to a current model id if needed
    messages=[
        {"role": "system", "content": "You are a concise CS tutor."},
        {"role": "user", "content": "Explain what an API is in 2 sentences."},
    ],
    temperature=0.7,              # try 0 vs 1.2 and notice the difference
)

print(resp.choices[0].message.content)
