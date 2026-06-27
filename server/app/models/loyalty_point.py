from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class LoyaltyPoint(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "loyalty_points"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(String(36), ForeignKey("orders.id"), index=True)
    points = Column(Integer, nullable=False)
    transaction_type = Column(String(40), nullable=False)
    reason = Column(Text)

    user = relationship("User", back_populates="loyalty_points")
    order = relationship("Order")
