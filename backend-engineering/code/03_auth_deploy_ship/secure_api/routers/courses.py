"""Module 2's courses, now behind a login — and one route behind a ROLE."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user, require_role
from database import get_db
from models import Course, User
from schemas import CourseIn, CourseOut

router = APIRouter(prefix="/courses", tags=["courses"])


# Anyone LOGGED IN can read. Note there is no token-checking code in the body.
@router.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Course)).all()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CourseOut)
def create_course(
    incoming: CourseIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin")),      # authorisation, not just authentication
):
    if db.get(Course, incoming.code) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Course {incoming.code} already exists")

    course = Course(**incoming.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


# dependencies=[...] runs the check purely for its side effect, when the endpoint
# does not need the user object itself.
@router.delete("/{code}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("admin"))])
def delete_course(code: str, db: Session = Depends(get_db)):
    course = db.get(Course, code)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No course with code {code}")
    db.delete(course)
    db.commit()
    return None
