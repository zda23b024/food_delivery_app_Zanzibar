from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class VerificationDocument(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "verification_documents"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(40), nullable=False, index=True)
    document_type = Column(String(80), nullable=False, index=True)
    status = Column(String(40), default="pending", nullable=False, index=True)
    document_url = Column(String(500), nullable=False)
    business_name = Column(String(180))
    certificate_number = Column(String(120))
    tax_id = Column(String(120))
    business_address = Column(Text)
    service_area = Column(String(180))
    vehicle_type = Column(String(80))
    vehicle_plate_number = Column(String(80))
    license_number = Column(String(120))
    national_id_number = Column(String(120))
    notes = Column(Text)

    user = relationship("User")
