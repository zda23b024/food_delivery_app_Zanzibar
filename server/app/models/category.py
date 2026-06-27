from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Category(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "categories"

    parent_id = Column(String(36), ForeignKey("categories.id"))
    name = Column(String(120), nullable=False, index=True)
    slug = Column(String(140), unique=True, nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String(500))
    sort_order = Column(Integer, default=0, nullable=False)

    parent = relationship("Category", remote_side="Category.id")
    food_items = relationship("FoodItem", back_populates="category")
