"""Module 2 · H — One error shape for the whole API.

Out of the box an app fails in three different shapes: FastAPI's {"detail": ...},
Pydantic's validation array, and whatever a crash produces. A caller then needs
three different bits of code to read your failures. Pick one shape instead.

Every failure below comes back as:
    {"error": {"code": "...", "message": "...", "status": 404}}

Run:  uv run fastapi dev 02_apis_and_databases/h1_errors_envelope.py
Try:  /students/99  ·  /students/abc  ·  /boom
"""
import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="One error shape")

students = [{"id": 1, "name": "Ada"}]

# A machine-readable code per status. The MESSAGE is for the human reading logs
# at 2am; the CODE is for the mobile app deciding what to do next. Never make a
# caller regex your English.
CODES = {
    400: "BAD_REQUEST",
    401: "UNAUTHENTICATED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
}


def envelope(status_code: int, message: str, **extra) -> JSONResponse:
    body = {"code": CODES.get(status_code, "ERROR"), "message": message, "status": status_code}
    body.update(extra)
    return JSONResponse(status_code=status_code, content={"error": body})


# Catches every HTTPException you raise, and the ones FastAPI raises for you.
@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    return envelope(exc.status_code, str(exc.detail))


# Catches "the body is the wrong shape" — the 422 Pydantic raises before your
# endpoint ever runs. exc.errors() says exactly which field was wrong.
@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    return envelope(422, "The request is not the right shape.",
                    fields=[{"field": ".".join(str(p) for p in e["loc"][1:]), "problem": e["msg"]}
                            for e in exc.errors()])


# The safety net. NEVER put the exception's text in the response: a stack trace
# leaks table names, file paths and library versions. Log the detail, return the code.
@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    logger.exception("unhandled error on %s", request.url.path)
    return envelope(500, "Something went wrong.")


@app.get("/students/{student_id}")
def get_student(student_id: int):
    for student in students:
        if student["id"] == student_id:
            return student
    raise HTTPException(status.HTTP_404_NOT_FOUND, f"No student with id {student_id}")


@app.get("/boom")
def boom():
    """Deliberately broken, to show what a 500 looks like from the outside."""
    return 1 / 0
