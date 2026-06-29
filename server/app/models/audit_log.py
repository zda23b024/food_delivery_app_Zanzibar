from sqlalchemy import Column, Integer, String, Text

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class AuditLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"

    user_id = Column(String(36), index=True)
    role = Column(String(32), index=True)
    method = Column(String(12), nullable=False)
    path = Column(String(500), nullable=False, index=True)
    status_code = Column(Integer, nullable=False)
    ip_address = Column(String(80))
    user_agent = Column(String(500))
    action = Column(String(120), index=True)
    detail = Column(Text)
