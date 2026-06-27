from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Restaurant(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "restaurants"

    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(160), nullable=False, index=True)
    slug = Column(String(180), unique=True, nullable=False, index=True)
    description = Column(Text)
    service_type = Column(String(40), default="restaurant", nullable=False, index=True)
    phone_number = Column(String(32), nullable=False)
    email = Column(String(255))
    logo_url = Column(String(500))
    cover_image_url = Column(String(500))
    cuisine_type = Column(String(120), index=True)
    address = Column(Text, nullable=False)
    area = Column(String(120), nullable=False, index=True)
    city = Column(String(120), default="Zanzibar", nullable=False)
    island = Column(String(40), default="Unguja", nullable=False, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    opening_time = Column(Time)
    closing_time = Column(Time)
    min_order_amount = Column(Numeric(10, 2), default=0, nullable=False)
    delivery_fee = Column(Numeric(10, 2), default=0, nullable=False)
    commission_rate = Column(Numeric(5, 2), default=15, nullable=False)
    average_rating = Column(Float, default=0, nullable=False)
    rating_count = Column(Integer, default=0, nullable=False)
    is_open = Column(Boolean, default=True, nullable=False)
    accepts_cash = Column(Boolean, default=True, nullable=False)
    accepts_mobile_money = Column(Boolean, default=True, nullable=False)
    supports_tourist_delivery = Column(Boolean, default=False, nullable=False)
    supports_hotel_delivery = Column(Boolean, default=False, nullable=False)
    supports_beach_delivery = Column(Boolean, default=False, nullable=False)

    owner = relationship("User", back_populates="restaurants")
    food_items = relationship("FoodItem", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")
    analytics = relationship("RestaurantAnalytics", back_populates="restaurant", cascade="all, delete-orphan")
