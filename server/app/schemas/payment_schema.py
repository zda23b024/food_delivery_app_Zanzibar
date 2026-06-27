from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: str
    method: str
    provider: str | None = None
    phone_number: str | None = None


class PaymentUpdate(BaseModel):
    status: str
    provider_reference: str | None = None
    failure_reason: str | None = None


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
    paid_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
