from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, RIDER
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.delivery_tracking import DeliveryTracking
from app.models.user import User
from app.schemas.support_schema import DeliveryTrackingCreate, DeliveryTrackingResponse


router = APIRouter(prefix="/delivery-tracking", tags=["Delivery Tracking"])


@router.post("", response_model=DeliveryTrackingResponse, status_code=status.HTTP_201_CREATED)
def create_tracking_event(
    payload: DeliveryTrackingCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RIDER, ADMIN)),
):
    event = DeliveryTracking(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/order/{order_id}", response_model=list[DeliveryTrackingResponse])
def order_tracking(order_id: str, db: Session = Depends(get_db)):
    return (
        db.query(DeliveryTracking)
        .filter(DeliveryTracking.order_id == order_id)
        .order_by(DeliveryTracking.created_at.desc())
        .all()
    )
