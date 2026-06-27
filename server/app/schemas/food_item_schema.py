from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class FoodItemCreate(BaseModel):
    restaurant_id: str
    category_id: str | None = None
    name: str = Field(..., min_length=2, max_length=160)
    description: str | None = None
    image_url: str | None = None
    price: Decimal
    discount_price: Decimal | None = None
    preparation_time_minutes: int = 20
    calories: int | None = None
    is_available: bool = True
    is_featured: bool = False
    is_halal: bool = True
    is_vegetarian: bool = False
    spice_level: str | None = None
    sort_order: int = 0


class FoodItemUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = None
    image_url: str | None = None
    price: Decimal | None = None
    discount_price: Decimal | None = None
    preparation_time_minutes: int | None = None
    calories: int | None = None
    is_available: bool | None = None
    is_featured: bool | None = None
    is_halal: bool | None = None
    is_vegetarian: bool | None = None
    spice_level: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class FoodItemResponse(BaseModel):
    id: str
    restaurant_id: str
    category_id: str | None = None
    name: str
    description: str | None = None
    image_url: str | None = None
    price: Decimal
    discount_price: Decimal | None = None
    preparation_time_minutes: int
    calories: int | None = None
    is_available: bool
    is_featured: bool
    is_halal: bool
    is_vegetarian: bool
    spice_level: str | None = None
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
