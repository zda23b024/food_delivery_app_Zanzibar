from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, CUSTOMER, RESTAURANT, RIDER
from app.core.config import settings
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
    PasswordResetConfirm,
    PasswordResetRequest,
    PhoneOtpRequest,
    PhoneOtpVerify,
    RefreshTokenRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.otp_service import (
    create_password_reset_token,
    create_phone_otp,
    get_valid_password_reset_record,
    verify_phone_otp,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])
SUPPORTED_ROLES = {CUSTOMER, RESTAURANT, RIDER, ADMIN}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if payload.role not in SUPPORTED_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported user role")
    duplicate_filters = [User.phone_number == payload.phone_number]
    if payload.email:
        duplicate_filters.append(User.email == payload.email)
    existing = db.query(User).filter(or_(*duplicate_filters)).first()
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
    user = db.query(User).filter(or_(User.phone_number == payload.phone_number, User.email == payload.phone_number)).first()
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


@router.post("/phone/request-otp")
def request_phone_otp(payload: PhoneOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number, User.is_active.is_(True)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    code = create_phone_otp(db, payload.phone_number, "phone_verification")
    response = {"message": "Verification code sent"}
    if settings.expose_dev_otp_codes:
        response["dev_code"] = code
    return response


@router.post("/phone/verify", response_model=UserResponse)
def verify_phone(payload: PhoneOtpVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number, User.is_active.is_(True)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_phone_otp(db, payload.phone_number, "phone_verification", payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    user.is_phone_verified = True
    db.commit()
    db.refresh(user)
    return user


@router.post("/password/request-reset")
def request_password_reset(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number, User.is_active.is_(True)).first()
    response = {"message": "If the phone number exists, a password reset code has been sent"}
    if user is None:
        return response
    token = create_password_reset_token(db, user)
    if settings.expose_dev_otp_codes:
        response["dev_reset_token"] = token
    return response


@router.post("/password/reset", response_model=MessageResponse)
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    reset_record = get_valid_password_reset_record(db, payload.token)
    if reset_record is None:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token")
    user = db.query(User).filter(User.id == reset_record.user_id, User.is_active.is_(True)).first()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid password reset token")
    user.password_hash = hash_password(payload.new_password)
    reset_record.consume()
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id, RefreshToken.is_revoked.is_(False)).update(
        {"is_revoked": True, "revoked_at": datetime.utcnow()}
    )
    db.commit()
    return MessageResponse(message="Password reset successfully")
