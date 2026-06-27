from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Promotion(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "promotions"

    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), index=True)
    title = Column(String(160), nullable=False)
    description = Column(Text)
    promotion_type = Column(String(40), nullable=False)
    discount_value = Column(Numeric(10, 2))
    starts_at = Column(DateTime, nullable=False)
    ends_at = Column(DateTime, nullable=False)
    image_url = Column(String(500))

    restaurant = relationship("Restaurant")
