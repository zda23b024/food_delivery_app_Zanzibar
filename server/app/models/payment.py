from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.constants.payment_status import PENDING
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Payment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "payments"

    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="TZS", nullable=False)
    method = Column(String(40), nullable=False, index=True)
    provider = Column(String(80))
    status = Column(String(40), default=PENDING, nullable=False, index=True)
    provider_reference = Column(String(160), unique=True)
    phone_number = Column(String(32))
    failure_reason = Column(Text)
    paid_at = Column(DateTime)

    order = relationship("Order", back_populates="payment")
    user = relationship("User")
    transactions = relationship("Transaction", back_populates="payment", cascade="all, delete-orphan")
