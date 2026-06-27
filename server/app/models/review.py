from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Review(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("order_id", "customer_id", name="uq_review_order_customer"),
    )

    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False, index=True)
    rider_id = Column(String(36), ForeignKey("riders.id"), index=True)
    food_rating = Column(Integer, nullable=False)
    delivery_rating = Column(Integer)
    restaurant_rating = Column(Integer)
    rider_rating = Column(Integer)
    overall_rating = Column(Integer, nullable=False, index=True)
    comment = Column(Text)
    image_url = Column(String(500))

    order = relationship("Order", back_populates="reviews")
    customer = relationship("User", back_populates="reviews")
    restaurant = relationship("Restaurant", back_populates="reviews")
    rider = relationship("Rider")
