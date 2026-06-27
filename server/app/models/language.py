from sqlalchemy import Boolean, Column, String

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Language(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "languages"

    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    native_name = Column(String(80), nullable=False)
    is_rtl = Column(Boolean, default=False, nullable=False)
