from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, CUSTOMER, RESTAURANT, RIDER
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user_schema import (
    RefreshTokenRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])
SUPPORTED_ROLES = {CUSTOMER, RESTAURANT, RIDER, ADMIN}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if payload.role not in SUPPORTED_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported user role")
    existing = (
        db.query(User)
        .filter((User.phone_number == payload.phone_number) | (User.email == payload.email))
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Phone number or email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone_number=payload.phone_number,
        password_hash=hash_password(payload.password),
        role=payload.role,
        preferred_language=payload.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    user.last_login_at = datetime.utcnow()
    access_token = create_access_token(user.id, user.role)
    refresh_token, token_id, expires_at = create_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_id=token_id, expires_at=expires_at))
    db.commit()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_refresh_token(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    token_record = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_id == token_payload.get("jti"),
            RefreshToken.user_id == token_payload.get("sub"),
        )
        .first()
    )
    if token_record is None or token_record.is_revoked or token_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid")

    user = db.query(User).filter(User.id == token_record.user_id, User.is_active.is_(True)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is invalid")

    token_record.revoke()
    access_token = create_access_token(user.id, user.role)
    new_refresh_token, token_id, expires_at = create_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_id=token_id, expires_at=expires_at))
    db.commit()
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_refresh_token(payload.refresh_token)
    except ValueError:
        return MessageResponse(message="Logged out")

    token_record = db.query(RefreshToken).filter(RefreshToken.token_id == token_payload.get("jti")).first()
    if token_record:
        token_record.revoke()
        db.commit()
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
