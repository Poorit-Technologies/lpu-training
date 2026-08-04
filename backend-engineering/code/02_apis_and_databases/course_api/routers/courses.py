"""Everything about courses lives here — and nothing else does."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Course
from schemas import CourseIn, CourseOut, CourseWithStudents

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    return db.scalars(select(Course)).all()


@router.get("/{code}", response_model=CourseWithStudents)
def get_course(code: str, db: Session = Depends(get_db)):
    # selectinload fetches the students in ONE extra query instead of one per
    # course. Without it, looping over 100 courses fires 101 queries — the
    # "N+1" problem. Watch the echoed SQL to see the difference.
    course = db.scalar(
        select(Course).where(Course.code == code).options(selectinload(Course.students))
    )
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No course with code {code}")
    return course


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CourseOut)
def create_course(incoming: CourseIn, db: Session = Depends(get_db)):
    if db.get(Course, incoming.code) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Course {incoming.code} already exists")

    course = Course(**incoming.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(code: str, db: Session = Depends(get_db)):
    course = db.get(Course, code)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No course with code {code}")
    db.delete(course)          # cascade in models.py removes its students too
    db.commit()
    return None
