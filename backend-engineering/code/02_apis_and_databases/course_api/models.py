"""The DATABASE tables.

Kept separate from schemas.py on purpose: a database row and an API response
are two different shapes of the same idea. The row may hold things the response
must never contain.
"""
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Course(Base):
    __tablename__ = "courses"

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    seats: Mapped[int] = mapped_column(Integer, default=60)

    # The "many" side seen from the one. No column is created by this line.
    students: Mapped[list["Student"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    # The real column: it stores another table's primary key.
    course_code: Mapped[str | None] = mapped_column(ForeignKey("courses.code"))
    course: Mapped["Course | None"] = relationship(back_populates="students")
