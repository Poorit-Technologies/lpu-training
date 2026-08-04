"""Register, log in, and 'who am I'."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import get_db
from models import User
from schemas import RegisterIn, Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def register(incoming: RegisterIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == incoming.email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "That email is already registered")

    user = User(
        email=incoming.email,
        hashed_password=hash_password(incoming.password),   # hashed HERE, once, at the edge
        role=incoming.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2PasswordRequestForm is what makes the /docs padlock work.

    It reads `username` and `password` as FORM fields, not JSON - that is the
    OAuth2 spec, and it is why this one endpoint looks different from the others.
    Our "username" is the email.
    """
    user = db.scalar(select(User).where(User.email == form.username))

    # One message for both failures, on purpose. "No such user" tells an attacker
    # which emails are registered - that is an account-enumeration leak.
    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(access_token=create_access_token(user.email, user.role))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    """The whole endpoint is the dependency. There is no auth code in here."""
    return user
