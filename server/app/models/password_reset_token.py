from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class PasswordResetToken(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "password_reset_tokens"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    consumed_at = Column(DateTime)
    is_consumed = Column(Boolean, default=False, nullable=False)

    def consume(self):
        self.is_consumed = True
        self.consumed_at = datetime.utcnow()


Index("ix_password_reset_tokens_user_active", PasswordResetToken.user_id, PasswordResetToken.is_consumed)
