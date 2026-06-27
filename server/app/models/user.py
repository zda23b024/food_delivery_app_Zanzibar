from sqlalchemy import Boolean, Column, DateTime, Index, String
from sqlalchemy.orm import relationship

from app.constants.roles import CUSTOMER
from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "users"

    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone_number = Column(String(32), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default=CUSTOMER, nullable=False, index=True)
    preferred_language = Column(String(10), default="en", nullable=False)
    profile_image_url = Column(String(500))
    is_phone_verified = Column(Boolean, default=False, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime)

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    rider_profile = relationship("Rider", back_populates="user", uselist=False)
    restaurants = relationship("Restaurant", back_populates="owner")
    orders = relationship("Order", back_populates="customer", foreign_keys="Order.customer_id")
    reviews = relationship("Review", back_populates="customer")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    loyalty_points = relationship("LoyaltyPoint", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


Index("ix_users_role_active", User.role, User.is_active)
