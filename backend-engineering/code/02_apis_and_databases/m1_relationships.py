"""Module 2 · M — one-to-many: one course has many students.

Two things students merge constantly, and they are not the same:
  ForeignKey    a real COLUMN in the database. It stores the link.
  relationship  no column at all. Python convenience that makes
                course.students and student.course work.

Before running:  docker compose -f 02_apis_and_databases/docker-compose.yml up -d
Run:             uv run python 02_apis_and_databases/m1_relationships.py

⚠️ This demo DROPS and recreates its two tables every run so it always works in
class. Your own app must never do that — that is what migrations are for.
"""
from sqlalchemy import ForeignKey, Integer, String, create_engine, select
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,
                            sessionmaker)

DATABASE_URL = "postgresql+psycopg://lpu:lpu@localhost:5432/lpudb"
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


class Course(Base):
    __tablename__ = "courses"

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    title: Mapped[str] = mapped_column(String(120))

    # The "many" side, seen from the one. Creates NO column.
    students: Mapped[list["Student"]] = relationship(back_populates="course")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80))

    # THIS is the real column. It holds another table's primary key —
    # that is the entire definition of a foreign key.
    course_code: Mapped[str | None] = mapped_column(ForeignKey("courses.code"))

    # And this is the Python-side convenience for the same link.
    course: Mapped["Course | None"] = relationship(back_populates="students")


Base.metadata.drop_all(bind=engine)      # demo only — see the warning above
Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    cse = Course(code="CSE101", title="Intro to Backend")
    ece = Course(code="ECE201", title="Signals")
    # Assign OBJECTS, not ids — SQLAlchemy fills in course_code for you.
    db.add_all([
        cse, ece,
        Student(name="Ada", course=cse),
        Student(name="Raj", course=cse),
        Student(name="Meera", course=ece),
    ])
    db.commit()

    print("\n--- one course, its many students ---")
    course = db.get(Course, "CSE101")
    print(f"{course.title}: {[s.name for s in course.students]}")

    print("\n--- and back the other way ---")
    student = db.scalar(select(Student).where(Student.name == "Meera"))
    print(f"{student.name} is enrolled in {student.course.title}")

    print("\n--- the database REFUSES a link that does not exist ---")
    try:
        db.add(Student(name="Ghost", course_code="NOPE999"))
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"rejected: {type(exc).__name__}")
        print("That refusal is the point. A Python list cannot do that.")
