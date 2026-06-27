from sqlalchemy import Boolean, Column, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Address(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "addresses"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(50), default="Home", nullable=False)
    contact_name = Column(String(120))
    contact_phone = Column(String(32))
    street_address = Column(Text, nullable=False)
    area = Column(String(120), nullable=False, index=True)
    city = Column(String(120), default="Zanzibar", nullable=False)
    island = Column(String(40), default="Unguja", nullable=False, index=True)
    landmark = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    delivery_notes = Column(Text)
    is_default = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="addresses")
