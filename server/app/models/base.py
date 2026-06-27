from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, String


def uuid_pk():
    return str(uuid4())


class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ActiveMixin:
    is_active = Column(Boolean, default=True, nullable=False)


class UUIDPrimaryKeyMixin:
    id = Column(String(36), primary_key=True, default=uuid_pk)
