from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.constants.payment_status import COD_PENDING, FAILED, PAID, PENDING, PROCESSING
from app.core.config import settings
from app.models.order import Order
from app.models.payment import Payment
from app.models.transaction import Transaction


SUPPORTED_MOBILE_MONEY_METHODS = {
    "m-pesa": "mpesa",
    "m pesa": "mpesa",
    "mpesa": "mpesa",
    "airtel money": "airtel_money",
    "airtel_money": "airtel_money",
    "tigo pesa": "tigo_pesa",
    "tigo_pesa": "tigo_pesa",
    "halopesa": "halopesa",
    "halo pesa": "halopesa",
}
SUPPORTED_CASH_METHODS = {"cash", "cash on delivery", "cod"}
SUPPORTED_PAYMENT_PROVIDERS = sorted(set(SUPPORTED_MOBILE_MONEY_METHODS.values()))


@dataclass
class PaymentInitiation:
    provider: str
    provider_reference: str
    checkout_reference: str
    status: str
    provider_message: str
    requires_customer_action: bool = True


def normalize_text(value: str) -> str:
    return value.strip().lower().replace("-", " ")


def normalize_payment_method(method: str) -> str:
    normalized = normalize_text(method)
    if normalized not in SUPPORTED_MOBILE_MONEY_METHODS:
        raise HTTPException(status_code=400, detail="Unsupported payment method")
    return SUPPORTED_MOBILE_MONEY_METHODS[normalized]


def is_cash_payment(method: str) -> bool:
    return normalize_text(method) in SUPPORTED_CASH_METHODS


def validate_phone_number(phone_number: str | None) -> str:
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number is required for mobile money payments")
    cleaned = phone_number.replace(" ", "")
    if not cleaned.startswith("+255") or len(cleaned) < 13:
        raise HTTPException(status_code=400, detail="Use a valid Tanzania phone number starting with +255")
    return cleaned


def provider_is_configured(provider: str) -> bool:
    if settings.payment_gateway_mode == "mock":
        return True
    if settings.payment_live_adapter == "aggregator":
        return bool(
            settings.payment_aggregator_base_url
            and settings.payment_aggregator_api_key
            and settings.payment_aggregator_api_secret
            and settings.payment_aggregator_merchant_id
        )
    credentials = {
        "mpesa": bool(settings.mpesa_api_key and settings.mpesa_api_secret),
        "airtel_money": bool(settings.airtel_money_client_id and settings.airtel_money_client_secret),
        "tigo_pesa": bool(settings.tigo_pesa_client_id and settings.tigo_pesa_client_secret),
        "halopesa": bool(settings.halopesa_client_id and settings.halopesa_client_secret),
    }
    return credentials.get(provider, False)


def get_provider_configuration_status() -> dict:
    return {
        "mode": settings.payment_gateway_mode,
        "live_adapter": settings.payment_live_adapter,
        "providers": {
            provider: {
                "configured": provider_is_configured(provider),
                "requires_phone_number": True,
            }
            for provider in SUPPORTED_PAYMENT_PROVIDERS
        },
        "cash": {"configured": True, "requires_phone_number": False},
    }


def initiate_mobile_money_payment(
    provider: str,
    amount: Decimal,
    phone_number: str,
    order_id: str,
) -> PaymentInitiation:
    if not provider_is_configured(provider):
        raise HTTPException(
            status_code=503,
            detail=f"{provider} credentials are not configured. Add provider credentials or use PAYMENT_GATEWAY_MODE=mock.",
        )

    checkout_reference = f"ZM-CHECKOUT-{uuid4().hex[:12].upper()}"
    provider_reference = f"{provider.upper()}-{uuid4().hex[:12].upper()}"
    if settings.payment_gateway_mode != "mock":
        if settings.payment_live_adapter != "aggregator":
            raise HTTPException(
                status_code=501,
                detail=(
                    "Live payment mode is enabled, but no provider adapter is configured. "
                    "Set PAYMENT_LIVE_ADAPTER=aggregator and provide aggregator credentials, "
                    "or keep PAYMENT_GATEWAY_MODE=mock for development."
                ),
            )
        raise HTTPException(
            status_code=501,
            detail=(
                "Aggregator credentials are configured, but the exact provider API contract is not installed yet. "
                "Provide the aggregator documentation so the live request signer and payload can be implemented."
            ),
        )
    message = (
        f"Mock {provider} STK/payment request created for {phone_number}. "
        "In production this calls the provider API and waits for a callback."
    )
    return PaymentInitiation(
        provider=provider,
        provider_reference=provider_reference,
        checkout_reference=checkout_reference,
        status=PROCESSING,
        provider_message=message,
        requires_customer_action=True,
    )


def create_cash_payment(order: Order) -> Payment:
    return Payment(
        order_id=order.id,
        user_id=order.customer_id,
        amount=order.total_amount,
        method="Cash",
        provider="cash",
        status=COD_PENDING,
        provider_reference=f"CASH-{uuid4().hex[:12].upper()}",
    )


def record_payment_transaction(
    db: Session,
    payment: Payment,
    transaction_type: str,
    status: str,
    amount: Decimal | None = None,
    notes: str | None = None,
) -> Transaction:
    transaction = Transaction(
        payment_id=payment.id,
        transaction_type=transaction_type,
        amount=amount or payment.amount,
        currency=payment.currency,
        status=status,
        provider_reference=payment.provider_reference,
        notes=notes,
    )
    db.add(transaction)
    return transaction


def sync_order_after_payment(payment: Payment) -> None:
    if payment.order is None:
        return
    if payment.status == PAID:
        payment.order.payment_method = payment.method


def apply_provider_callback(
    db: Session,
    payment: Payment,
    status: str,
    provider_message: str | None = None,
) -> Payment:
    normalized = status.strip().lower()
    if payment.status == PAID and normalized in {"success", "successful", "paid", PAID}:
        record_payment_transaction(db, payment, "callback_duplicate", PAID, notes=provider_message)
        return payment
    if normalized in {"success", "successful", "paid", PAID}:
        payment.status = PAID
        payment.failure_reason = None
        payment.paid_at = datetime.utcnow()
        record_payment_transaction(db, payment, "callback", PAID, notes=provider_message)
    elif normalized in {"failed", "failure", "cancelled", "canceled", FAILED}:
        payment.status = FAILED
        payment.failure_reason = provider_message or "Payment failed"
        record_payment_transaction(db, payment, "callback", FAILED, notes=provider_message)
    elif normalized in {"pending", "processing", PENDING, PROCESSING}:
        payment.status = PROCESSING
        record_payment_transaction(db, payment, "callback", PROCESSING, notes=provider_message)
    else:
        raise HTTPException(status_code=400, detail="Unsupported callback payment status")
    sync_order_after_payment(payment)
    return payment
