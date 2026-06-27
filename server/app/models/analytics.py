from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class RestaurantAnalytics(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "restaurant_analytics"
    __table_args__ = (
        UniqueConstraint("restaurant_id", "report_date", name="uq_restaurant_daily_analytics"),
    )

    restaurant_id = Column(String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    report_date = Column(Date, nullable=False, index=True)
    orders_count = Column(Integer, default=0, nullable=False)
    cancelled_orders_count = Column(Integer, default=0, nullable=False)
    gross_revenue = Column(Numeric(12, 2), default=0, nullable=False)
    commission_amount = Column(Numeric(12, 2), default=0, nullable=False)
    average_preparation_minutes = Column(Integer, default=0, nullable=False)

    restaurant = relationship("Restaurant", back_populates="analytics")
