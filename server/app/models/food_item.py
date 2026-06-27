from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class FoodItem(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "food_items"

    restaurant_id = Column(String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id"), index=True)
    name = Column(String(160), nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String(500))
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2))
    preparation_time_minutes = Column(Integer, default=20, nullable=False)
    calories = Column(Integer)
    is_available = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_halal = Column(Boolean, default=True, nullable=False)
    is_vegetarian = Column(Boolean, default=False, nullable=False)
    spice_level = Column(String(20))
    sort_order = Column(Integer, default=0, nullable=False)

    restaurant = relationship("Restaurant", back_populates="food_items")
    category = relationship("Category", back_populates="food_items")
    order_items = relationship("OrderItem", back_populates="food_item")
    favorites = relationship("Favorite", back_populates="food_item", cascade="all, delete-orphan")
