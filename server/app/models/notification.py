from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notifications"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(160), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False, index=True)
    channel = Column(String(40), default="push", nullable=False)
    data_json = Column(Text)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime)

    user = relationship("User", back_populates="notifications")
