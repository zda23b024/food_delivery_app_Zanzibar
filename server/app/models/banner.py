from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base
from app.models.base import ActiveMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Banner(UUIDPrimaryKeyMixin, TimestampMixin, ActiveMixin, Base):
    __tablename__ = "advertisement_banners"

    title = Column(String(160), nullable=False)
    image_url = Column(String(500), nullable=False)
    target_url = Column(String(500))
    placement = Column(String(80), default="home", nullable=False, index=True)
    starts_at = Column(DateTime)
    ends_at = Column(DateTime)
    sort_order = Column(Integer, default=0, nullable=False)
