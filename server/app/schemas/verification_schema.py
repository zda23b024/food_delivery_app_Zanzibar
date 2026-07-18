from datetime import datetime

from pydantic import BaseModel


class VerificationDocumentResponse(BaseModel):
    id: str
    user_id: str
    role: str
    document_type: str
    status: str
    document_url: str
    business_name: str | None = None
    certificate_number: str | None = None
    tax_id: str | None = None
    business_address: str | None = None
    service_area: str | None = None
    vehicle_type: str | None = None
    vehicle_plate_number: str | None = None
    license_number: str | None = None
    national_id_number: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
