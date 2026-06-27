from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.payment_status import PAID, PENDING
from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.order import Order
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment_schema import PaymentCreate, PaymentResponse, PaymentUpdate


router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
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
    payment = Payment(
        order_id=order.id,
        user_id=order.customer_id,
        amount=order.total_amount,
        method=payload.method,
        provider=payload.provider,
        phone_number=payload.phone_number,
        status=PENDING,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
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
    db.commit()
    db.refresh(payment)
    return payment
