"""The database tables. Course and Student are Module 2's; User is new."""
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    # NOT "password". The name matters: it documents that the plain password was
    # never stored, and it stops anyone casually returning this field.
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)

    role: Mapped[str] = mapped_column(String(20), default="student")


class Course(Base):
    __tablename__ = "courses"

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    seats: Mapped[int] = mapped_column(Integer, default=60)

    students: Mapped[list["Student"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    course_code: Mapped[str | None] = mapped_column(ForeignKey("courses.code"))
    course: Mapped["Course | None"] = relationship(back_populates="students")
