"""Everything about students lives here - and nothing else does."""
from fastapi import APIRouter, HTTPException, status

from schemas import StudentIn, StudentOut

# prefix: every path below starts with /students, so we don't repeat it
# tags:   groups these endpoints together in /docs
router = APIRouter(prefix="/students", tags=["students"])

students = [
    {"id": 1, "name": "Ada", "branch": "CSE"},
    {"id": 2, "name": "Raj", "branch": "ECE"},
]


@router.get("", response_model=list[StudentOut])
def list_students():
    return students


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int):
    for student in students:
        if student["id"] == student_id:
            return student
    raise HTTPException(status_code=404, detail=f"No student with id {student_id}")


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(new_student: StudentIn):
    student = {
        "id": len(students) + 1,
        "name": new_student.name,
        "branch": new_student.branch,
    }
    students.append(student)
    return student
