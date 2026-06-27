from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.constants.order_status import PENDING
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    order_number = Column(String(40), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False, index=True)
    rider_id = Column(String(36), ForeignKey("riders.id"), index=True)
    delivery_address_id = Column(String(36), ForeignKey("addresses.id"))
    coupon_id = Column(String(36), ForeignKey("coupons.id"))
    status = Column(String(40), default=PENDING, nullable=False, index=True)
    delivery_type = Column(String(40), default="standard", nullable=False)
    service_type = Column(String(40), default="food", nullable=False, index=True)
    payment_method = Column(String(40), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), default=0, nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0, nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    customer_notes = Column(Text)
    cancellation_reason = Column(Text)
    estimated_delivery_at = Column(DateTime)
    accepted_at = Column(DateTime)
    prepared_at = Column(DateTime)
    picked_up_at = Column(DateTime)
    delivered_at = Column(DateTime)
    cancelled_at = Column(DateTime)

    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    restaurant = relationship("Restaurant", back_populates="orders")
    rider = relationship("Rider", back_populates="orders")
    delivery_address = relationship("Address")
    coupon = relationship("Coupon", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    tracking_events = relationship("DeliveryTracking", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order")
