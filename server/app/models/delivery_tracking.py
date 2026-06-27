from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class DeliveryTracking(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "delivery_tracking"

    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    rider_id = Column(String(36), ForeignKey("riders.id"), index=True)
    status = Column(String(40), nullable=False, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    eta_minutes = Column(Float)
    distance_km = Column(Float)
    message = Column(Text)
    recorded_at = Column(DateTime)

    order = relationship("Order", back_populates="tracking_events")
    rider = relationship("Rider", back_populates="tracking_events")
