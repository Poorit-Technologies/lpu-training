"""🌉 The bridge — Week 1's AI, behind Week 2's login.

This is the whole point of the two weeks meeting: an AI feature is just another
endpoint. It takes a request, it returns JSON, it sits behind the same
get_current_user as everything else. Nothing about it is special.

Runs WITHOUT an API key - it falls back to a canned answer so the endpoint is
always demonstrable in class.
"""
import os

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Course, User
from schemas import AskIn, AskOut

router = APIRouter(prefix="/ask", tags=["ai"])


@router.post("", response_model=AskOut)
def ask(
    incoming: AskIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),      # same padlock as every other route
):
    # 1 · RETRIEVE — the "R" in RAG. Week 1 pulled context from a vector store;
    #     here the context is your own database. Same idea, simpler source.
    courses = db.scalars(select(Course)).all()
    context = "\n".join(f"- {c.code}: {c.title} ({c.seats} seats)" for c in courses)

    if not context:
        return AskOut(question=incoming.question, grounded=False,
                      answer="There are no courses in the database yet, so I cannot answer that.")

    # 2 · AUGMENT — the context goes into the prompt, so the model answers from
    #     YOUR data instead of from whatever it happens to remember.
    prompt = (
        "Answer using ONLY the course list below. "
        "If the answer is not in it, say you do not know.\n\n"
        f"Courses:\n{context}\n\nQuestion: {incoming.question}"
    )

    # 3 · GENERATE — and if there is no key, degrade honestly rather than crash.
    if not os.getenv("OPENAI_API_KEY"):
        return AskOut(
            question=incoming.question,
            grounded=True,
            answer=("(no OPENAI_API_KEY set - showing the retrieved context instead)\n" + context),
        )

    from openai import OpenAI

    reply = OpenAI().chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
    )
    return AskOut(question=incoming.question, grounded=True,
                  answer=reply.choices[0].message.content)
