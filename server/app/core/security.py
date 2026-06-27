from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return password_context.verify(plain_password, password_hash)


def create_access_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(subject: str, expires_delta: timedelta | None = None) -> tuple[str, str, datetime]:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(days=settings.refresh_token_expire_days)
    )
    token_id = str(uuid4())
    payload: dict[str, Any] = {
        "sub": subject,
        "jti": token_id,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.refresh_secret_key, algorithm=settings.algorithm)
    return token, token_id, expire


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise ValueError("Invalid access token") from exc
    if payload.get("type") != "access":
        raise ValueError("Invalid token type")
    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.refresh_secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise ValueError("Invalid refresh token") from exc
    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type")
    return payload
