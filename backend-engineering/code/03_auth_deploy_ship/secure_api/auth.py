"""Everything about who is asking. This is the heart of the module.

Note the shape: get_current_user is get_db with a different body. Same Depends,
same position in the endpoint signature. Nothing new was invented for auth.
"""
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import User

# ⚠️ NEVER a literal in a real app. This default exists so the file runs in class;
# on Render you set SECRET_KEY in the dashboard and this line is never used.
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
TOKEN_MINUTES = 30

password_hash = PasswordHash((BcryptHasher(),))

# This is what puts the padlock button in /docs. tokenUrl tells Swagger which
# endpoint to POST the username and password to.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(plain: str) -> str:
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)


def create_access_token(subject: str, role: str) -> str:
    payload = {
        "sub": subject,                                                  # who
        "role": role,                                                    # what they may do
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),          # a dependency can use another dependency
) -> User:
    """Turn a token back into a user, or refuse. Every protected route uses this."""
    credentials_error = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        # Covers tampering, a wrong secret AND expiry - all the same answer to
        # the caller, deliberately. Never tell an attacker WHICH part failed.
        raise credentials_error

    email = payload.get("sub")
    if email is None:
        raise credentials_error

    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        # The token was valid but the account is gone. Still a 401.
        raise credentials_error
    return user


def require_role(*allowed: str):
    """Authorisation, not authentication: WHO you are vs WHAT you may do.

    Returns a dependency, so it can be configured per route:
        @router.delete("/{code}", dependencies=[Depends(require_role("admin"))])
    """
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            # 403, not 401. 401 = "I don't know who you are".
            # 403 = "I know exactly who you are, and no."
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"This needs one of these roles: {', '.join(allowed)}",
            )
        return user
    return checker
