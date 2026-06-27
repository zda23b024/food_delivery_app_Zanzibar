from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Rider(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "riders"

    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    vehicle_type = Column(String(40), nullable=False)
    vehicle_plate_number = Column(String(40), index=True)
    license_number = Column(String(80))
    national_id_number = Column(String(80))
    service_area = Column(String(120), index=True)
    island = Column(String(40), default="Unguja", nullable=False, index=True)
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    is_online = Column(Boolean, default=False, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    average_rating = Column(Float, default=0, nullable=False)
    rating_count = Column(Integer, default=0, nullable=False)
    total_deliveries = Column(Integer, default=0, nullable=False)
    total_earnings = Column(Numeric(12, 2), default=0, nullable=False)

    user = relationship("User", back_populates="rider_profile")
    orders = relationship("Order", back_populates="rider")
    tracking_events = relationship("DeliveryTracking", back_populates="rider")
