from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class RiderCreate(BaseModel):
    user_id: str
    vehicle_type: str
    vehicle_plate_number: str | None = None
    license_number: str | None = None
    national_id_number: str | None = None
    service_area: str | None = None
    island: str = "Unguja"


class RiderUpdate(BaseModel):
    vehicle_type: str | None = None
    vehicle_plate_number: str | None = None
    license_number: str | None = None
    national_id_number: str | None = None
    service_area: str | None = None
    island: str | None = None
    current_latitude: float | None = None
    current_longitude: float | None = None
    is_online: bool | None = None
    is_available: bool | None = None
    is_active: bool | None = None


class RiderResponse(BaseModel):
    id: str
    user_id: str
    vehicle_type: str
    vehicle_plate_number: str | None = None
    service_area: str | None = None
    island: str
    current_latitude: float | None = None
    current_longitude: float | None = None
    is_online: bool
    is_available: bool
    average_rating: float
    rating_count: int
    total_deliveries: int
    total_earnings: Decimal
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
