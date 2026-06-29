from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, RIDER
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.delivery_tracking import DeliveryTracking
from app.models.rider import Rider
from app.models.user import User
from app.routes.live_tracking import manager as live_tracking_manager
from app.schemas.support_schema import DeliveryTrackingCreate, DeliveryTrackingResponse


router = APIRouter(prefix="/delivery-tracking", tags=["Delivery Tracking"])


@router.post("", response_model=DeliveryTrackingResponse, status_code=status.HTTP_201_CREATED)
async def create_tracking_event(
    payload: DeliveryTrackingCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RIDER, ADMIN)),
):
    event = DeliveryTracking(**payload.model_dump(), recorded_at=datetime.utcnow())
    db.add(event)
    if payload.rider_id and payload.latitude is not None and payload.longitude is not None:
        rider = db.query(Rider).filter(Rider.id == payload.rider_id).first()
        if rider:
            rider.current_latitude = payload.latitude
            rider.current_longitude = payload.longitude
    db.commit()
    db.refresh(event)
    await live_tracking_manager.broadcast(
        event.order_id,
        {
            "order_id": event.order_id,
            "type": "location_update",
            "status": event.status,
            "rider_id": event.rider_id,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "eta_minutes": event.eta_minutes,
            "distance_km": event.distance_km,
            "message": event.message,
            "sent_at": event.recorded_at.isoformat() if event.recorded_at else datetime.utcnow().isoformat(),
        },
    )
    return event


@router.get("/order/{order_id}", response_model=list[DeliveryTrackingResponse])
def order_tracking(order_id: str, db: Session = Depends(get_db)):
    return (
        db.query(DeliveryTracking)
        .filter(DeliveryTracking.order_id == order_id)
        .order_by(DeliveryTracking.created_at.desc())
        .all()
    )
