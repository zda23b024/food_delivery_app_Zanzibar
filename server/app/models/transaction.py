from sqlalchemy import Column, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Transaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transactions"

    payment_id = Column(String(36), ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type = Column(String(40), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="TZS", nullable=False)
    status = Column(String(40), nullable=False, index=True)
    provider_reference = Column(String(160), index=True)
    notes = Column(Text)

    payment = relationship("Payment", back_populates="transactions")
