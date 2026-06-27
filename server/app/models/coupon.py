from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Coupon(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "coupons"

    code = Column(String(60), unique=True, nullable=False, index=True)
    title = Column(String(160), nullable=False)
    description = Column(Text)
    discount_type = Column(String(30), nullable=False)
    discount_value = Column(Numeric(10, 2), nullable=False)
    minimum_order_amount = Column(Numeric(10, 2), default=0, nullable=False)
    maximum_discount_amount = Column(Numeric(10, 2))
    usage_limit = Column(Integer)
    used_count = Column(Integer, default=0, nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    first_order_only = Column(Boolean, default=False, nullable=False)

    orders = relationship("Order", back_populates="coupon")
