from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class OrderItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "order_items"

    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    food_item_id = Column(String(36), ForeignKey("food_items.id"), nullable=False, index=True)
    item_name = Column(String(160), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    special_instructions = Column(Text)

    order = relationship("Order", back_populates="items")
    food_item = relationship("FoodItem", back_populates="order_items")
