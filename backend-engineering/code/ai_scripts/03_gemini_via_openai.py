"""Day 1 · AI — call Gemini using the SAME OpenAI client.
Google exposes an OpenAI-compatible endpoint, so only 3 things change:
  api_key, base_url, model.

Run:    uv run python Day01/ai/03_gemini_via_openai.py
Needs:  GEMINI_API_KEY in your .env
"""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.environ["GEMINI_API_KEY"],
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

resp = client.chat.completions.create(
    model="gemini-3.6-flash",     # change to a current Gemini id if needed
    messages=[
        {"role": "user", "content": "Explain what an API is in 2 sentences."},
    ],
)

print(resp.choices[0].message.content)
