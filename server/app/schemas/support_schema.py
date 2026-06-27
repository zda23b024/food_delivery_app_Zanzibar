from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    label: str = "Home"
    contact_name: str | None = None
    contact_phone: str | None = None
    street_address: str
    area: str
    city: str = "Zanzibar"
    island: str = "Unguja"
    landmark: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    delivery_notes: str | None = None
    is_default: bool = False


class AddressResponse(AddressCreate):
    id: str
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponCreate(BaseModel):
    code: str
    title: str
    description: str | None = None
    discount_type: str
    discount_value: Decimal
    minimum_order_amount: Decimal = Decimal("0")
    maximum_discount_amount: Decimal | None = None
    usage_limit: int | None = None
    valid_from: datetime
    valid_until: datetime
    first_order_only: bool = False


class CouponResponse(CouponCreate):
    id: str
    used_count: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DeliveryTrackingCreate(BaseModel):
    order_id: str
    rider_id: str | None = None
    status: str
    latitude: float | None = None
    longitude: float | None = None
    eta_minutes: float | None = None
    distance_km: float | None = None
    message: str | None = None


class DeliveryTrackingResponse(DeliveryTrackingCreate):
    id: str
    recorded_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: str
    channel: str = "push"
    data_json: str | None = None


class NotificationResponse(NotificationCreate):
    id: str
    is_read: bool
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PromotionCreate(BaseModel):
    restaurant_id: str | None = None
    title: str
    description: str | None = None
    promotion_type: str
    discount_value: Decimal | None = None
    starts_at: datetime
    ends_at: datetime
    image_url: str | None = None


class PromotionResponse(PromotionCreate):
    id: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BannerCreate(BaseModel):
    title: str
    image_url: str
    target_url: str | None = None
    placement: str = "home"
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    sort_order: int = 0


class BannerResponse(BannerCreate):
    id: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LanguageCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=10)
    name: str
    native_name: str
    is_rtl: bool = False


class LanguageResponse(LanguageCreate):
    id: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
