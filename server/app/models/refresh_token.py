from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class RefreshToken(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "refresh_tokens"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_id = Column(String(80), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime)
    is_revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User")

    def revoke(self) -> None:
        self.is_revoked = True
        self.revoked_at = datetime.utcnow()
