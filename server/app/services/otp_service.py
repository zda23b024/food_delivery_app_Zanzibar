from datetime import datetime, timedelta
import hashlib
import secrets

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.otp_code import OtpCode
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User


def _hash_value(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def create_phone_otp(db: Session, phone_number: str, purpose: str) -> str:
    db.query(OtpCode).filter(
        OtpCode.phone_number == phone_number,
        OtpCode.purpose == purpose,
        OtpCode.is_consumed.is_(False),
    ).update({"is_consumed": True, "consumed_at": datetime.utcnow()})
    code = generate_otp_code()
    db.add(
        OtpCode(
            phone_number=phone_number,
            purpose=purpose,
            code_hash=_hash_value(code),
            expires_at=datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes),
        )
    )
    db.commit()
    return code


def verify_phone_otp(db: Session, phone_number: str, purpose: str, code: str) -> bool:
    record = (
        db.query(OtpCode)
        .filter(
            OtpCode.phone_number == phone_number,
            OtpCode.purpose == purpose,
            OtpCode.is_consumed.is_(False),
        )
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if record is None or record.expires_at < datetime.utcnow():
        return False
    if record.code_hash != _hash_value(code):
        return False
    record.consume()
    db.commit()
    return True


def create_password_reset_token(db: Session, user: User) -> str:
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.is_consumed.is_(False),
    ).update({"is_consumed": True, "consumed_at": datetime.utcnow()})
    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_value(token),
            expires_at=datetime.utcnow() + timedelta(minutes=settings.password_reset_expire_minutes),
        )
    )
    db.commit()
    return token


def get_valid_password_reset_record(db: Session, token: str) -> PasswordResetToken | None:
    return (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == _hash_value(token),
            PasswordResetToken.is_consumed.is_(False),
            PasswordResetToken.expires_at >= datetime.utcnow(),
        )
        .first()
    )
