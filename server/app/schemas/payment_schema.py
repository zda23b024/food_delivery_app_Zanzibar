from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: str
    method: str
    provider: str | None = None
    phone_number: str | None = None


class PaymentUpdate(BaseModel):
    status: Literal["pending", "processing", "authorized", "paid", "failed", "refunded", "cod_pending"]
    provider_reference: str | None = None
    failure_reason: str | None = None


class PaymentCallback(BaseModel):
    provider_reference: str
    status: str
    amount: Decimal | None = None
    phone_number: str | None = None
    provider_message: str | None = None
    callback_secret: str


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    user_id: str
    amount: Decimal
    currency: str
    method: str
    provider: str | None = None
    status: str
    provider_reference: str | None = None
    phone_number: str | None = None
    failure_reason: str | None = None
    paid_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentInitiationResponse(PaymentResponse):
    checkout_reference: str | None = None
    provider_message: str | None = None
    requires_customer_action: bool = True
