from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.payment_status import PAID
from app.constants.roles import ADMIN
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.order import Order
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment_schema import PaymentCallback, PaymentCreate, PaymentInitiationResponse, PaymentResponse, PaymentUpdate
from app.services.payment_service import (
    apply_provider_callback,
    initiate_mobile_money_payment,
    normalize_payment_method,
    record_payment_transaction,
    validate_phone_number,
)


router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("", response_model=list[PaymentResponse])
def list_payments(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()


@router.post("", response_model=PaymentInitiationResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != ADMIN and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can pay only for your order")

    existing = db.query(Payment).filter(Payment.order_id == order.id).first()
    if existing:
        return PaymentInitiationResponse.model_validate(
            existing,
            from_attributes=True,
        ).model_copy(
            update={
                "checkout_reference": existing.provider_reference,
                "provider_message": "Payment already exists for this order",
                "requires_customer_action": existing.status not in {PAID},
            }
        )

    provider = normalize_payment_method(payload.provider or payload.method)
    phone_number = validate_phone_number(payload.phone_number)
    initiation = initiate_mobile_money_payment(
        provider=provider,
        amount=order.total_amount,
        phone_number=phone_number,
        order_id=order.id,
    )

    payment = Payment(
        order_id=order.id,
        user_id=order.customer_id,
        amount=order.total_amount,
        method=payload.method,
        provider=initiation.provider,
        phone_number=phone_number,
        status=initiation.status,
        provider_reference=initiation.provider_reference,
    )
    db.add(payment)
    db.flush()
    record_payment_transaction(
        db,
        payment,
        transaction_type="initiation",
        status=payment.status,
        notes=initiation.provider_message,
    )
    db.commit()
    db.refresh(payment)
    response = PaymentInitiationResponse.model_validate(payment, from_attributes=True)
    return response.model_copy(
        update={
            "checkout_reference": initiation.checkout_reference,
            "provider_message": initiation.provider_message,
            "requires_customer_action": initiation.requires_customer_action,
        }
    )


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    if current_user.role != ADMIN and payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You cannot view this payment")
    return payment


@router.patch("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: str,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = payload.status
    payment.provider_reference = payload.provider_reference
    payment.failure_reason = payload.failure_reason
    if payload.status == PAID:
        payment.paid_at = datetime.utcnow()
    record_payment_transaction(
        db,
        payment,
        transaction_type="manual_update",
        status=payment.status,
        notes=payload.failure_reason,
    )
    db.commit()
    db.refresh(payment)
    return payment


@router.post("/callbacks/mobile-money", response_model=PaymentResponse)
def mobile_money_callback(payload: PaymentCallback, db: Session = Depends(get_db)):
    if payload.callback_secret != settings.payment_callback_secret:
        raise HTTPException(status_code=401, detail="Invalid payment callback secret")

    payment = db.query(Payment).filter(Payment.provider_reference == payload.provider_reference).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payload.amount is not None and payload.amount != payment.amount:
        raise HTTPException(status_code=400, detail="Callback amount does not match payment amount")

    apply_provider_callback(db, payment, payload.status, payload.provider_message)
    db.commit()
    db.refresh(payment)
    return payment
