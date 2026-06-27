from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    food_item_id: str
    quantity: int = Field(..., ge=1)
    special_instructions: str | None = None


class OrderCreate(BaseModel):
    restaurant_id: str
    delivery_address_id: str | None = None
    coupon_id: str | None = None
    payment_method: str
    delivery_type: str = "standard"
    service_type: str = "food"
    customer_notes: str | None = None
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str
    rider_id: str | None = None
    cancellation_reason: str | None = None


class OrderItemResponse(BaseModel):
    id: str
    food_item_id: str
    item_name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    special_instructions: str | None = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_id: str
    restaurant_id: str
    rider_id: str | None = None
    status: str
    delivery_type: str
    service_type: str
    payment_method: str
    subtotal: Decimal
    delivery_fee: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    customer_notes: str | None = None
    estimated_delivery_at: datetime | None = None
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}
