"""Day 1 · AI — one interface, many providers, with LiteLLM.
Swap the model string to switch provider — no new SDK, no rewrite.

Run:    uv run python Day01/ai/04_litellm_demo.py
Needs:  whichever keys you have (OPENAI_API_KEY / GEMINI_API_KEY / ANTHROPIC_API_KEY)
"""
from dotenv import load_dotenv
from litellm import completion

load_dotenv()

models = [
    "openai/gpt-5.6",
    "gemini/gemini-3.6-flash",
    # "anthropic/claude-opus-5",
]

for model in models:
    try:
        resp = completion(
            model=model,
            messages=[{"role": "user", "content": "Say hello in 5 words."}],
        )
        print(f"{model} -> {resp.choices[0].message.content}")
    except Exception as e:
        print(f"{model} -> skipped ({e.__class__.__name__}: set its API key / model id)")
