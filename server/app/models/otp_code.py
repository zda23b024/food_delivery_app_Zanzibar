from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Index, String

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class OtpCode(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "otp_codes"

    phone_number = Column(String(32), nullable=False, index=True)
    purpose = Column(String(40), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    consumed_at = Column(DateTime)
    is_consumed = Column(Boolean, default=False, nullable=False)

    def consume(self):
        self.is_consumed = True
        self.consumed_at = datetime.utcnow()


Index("ix_otp_codes_phone_purpose_active", OtpCode.phone_number, OtpCode.purpose, OtpCode.is_consumed)
