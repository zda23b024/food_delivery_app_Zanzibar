from datetime import datetime, time
from decimal import Decimal

from pydantic import BaseModel, Field


class RestaurantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=160)
    description: str | None = None
    service_type: str = "restaurant"
    phone_number: str
    email: str | None = None
    cuisine_type: str | None = None
    address: str
    area: str
    city: str = "Zanzibar"
    island: str = "Unguja"
    latitude: float | None = None
    longitude: float | None = None
    opening_time: time | None = None
    closing_time: time | None = None
    min_order_amount: Decimal = Decimal("0")
    delivery_fee: Decimal = Decimal("0")
    commission_rate: Decimal = Decimal("15")
    accepts_cash: bool = True
    accepts_mobile_money: bool = True
    supports_tourist_delivery: bool = False
    supports_hotel_delivery: bool = False
    supports_beach_delivery: bool = False


class RestaurantCreate(RestaurantBase):
    slug: str | None = None
    logo_url: str | None = None
    cover_image_url: str | None = None


class RestaurantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = None
    service_type: str | None = None
    phone_number: str | None = None
    email: str | None = None
    logo_url: str | None = None
    cover_image_url: str | None = None
    cuisine_type: str | None = None
    address: str | None = None
    area: str | None = None
    city: str | None = None
    island: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    opening_time: time | None = None
    closing_time: time | None = None
    min_order_amount: Decimal | None = None
    delivery_fee: Decimal | None = None
    commission_rate: Decimal | None = None
    is_open: bool | None = None
    is_active: bool | None = None
    accepts_cash: bool | None = None
    accepts_mobile_money: bool | None = None
    supports_tourist_delivery: bool | None = None
    supports_hotel_delivery: bool | None = None
    supports_beach_delivery: bool | None = None


class RestaurantResponse(RestaurantBase):
    id: str
    owner_id: str
    slug: str
    logo_url: str | None = None
    cover_image_url: str | None = None
    average_rating: float
    rating_count: int
    is_open: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
