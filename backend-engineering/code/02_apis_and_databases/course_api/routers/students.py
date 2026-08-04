"""Everything about students lives here — and nothing else does."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Course, Student
from schemas import StudentIn, StudentOut

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.scalars(select(Student)).all()


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No student with id {student_id}")
    return student


@router.post("", status_code=status.HTTP_201_CREATED, response_model=StudentOut)
def create_student(incoming: StudentIn, db: Session = Depends(get_db)):
    # 409 — the email is already taken
    if db.scalar(select(Student).where(Student.email == incoming.email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"{incoming.email} is already registered")

    # 404 — you cannot enrol on a course that does not exist. The database would
    # refuse this anyway (that is what the foreign key is for); catching it here
    # just turns a 500 into a sentence the caller can read.
    if incoming.course_code is not None and db.get(Course, incoming.course_code) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No course with code {incoming.course_code}")

    student = Student(**incoming.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No student with id {student_id}")
    db.delete(student)
    db.commit()
    return None
