from sqlalchemy import Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Favorite(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "restaurant_id", "food_item_id", name="uq_user_favorite_target"),
    )

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), index=True)
    food_item_id = Column(String(36), ForeignKey("food_items.id"), index=True)

    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant")
    food_item = relationship("FoodItem", back_populates="favorites")
