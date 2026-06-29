from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, RIDER
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.rider import Rider
from app.models.order import Order
from app.models.user import User
from app.schemas.rider_schema import RiderCreate, RiderResponse, RiderUpdate
from app.schemas.order_schema import OrderResponse


router = APIRouter(prefix="/riders", tags=["Riders"])


@router.post("", response_model=RiderResponse, status_code=status.HTTP_201_CREATED)
def create_rider(
    payload: RiderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    rider = Rider(**payload.model_dump())
    db.add(rider)
    db.commit()
    db.refresh(rider)
    return rider


@router.get("", response_model=list[RiderResponse])
def list_riders(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    return db.query(Rider).order_by(Rider.created_at.desc()).all()


@router.get("/me", response_model=RiderResponse)
def get_my_rider_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RIDER)),
):
    rider = db.query(Rider).filter(Rider.user_id == current_user.id).first()
    if rider is None:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    return rider


@router.get("/me/orders", response_model=list[OrderResponse])
def get_my_rider_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RIDER)),
):
    rider = db.query(Rider).filter(Rider.user_id == current_user.id).first()
    if rider is None:
        return []
    return db.query(Order).filter(Order.rider_id == rider.id).order_by(Order.created_at.desc()).all()


@router.get("/available-orders", response_model=list[OrderResponse])
def get_available_orders(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RIDER, ADMIN)),
):
    return (
        db.query(Order)
        .filter(Order.rider_id.is_(None), Order.status.in_(["accepted", "preparing", "ready_for_pickup"]))
        .order_by(Order.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/me/earnings")
def get_my_earnings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RIDER)),
):
    rider = db.query(Rider).filter(Rider.user_id == current_user.id).first()
    if rider is None:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    return {
        "rider_id": rider.id,
        "total_deliveries": rider.total_deliveries,
        "total_earnings": str(rider.total_earnings),
        "average_rating": rider.average_rating,
        "rating_count": rider.rating_count,
    }


@router.patch("/{rider_id}", response_model=RiderResponse)
def update_rider(
    rider_id: str,
    payload: RiderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rider = db.query(Rider).filter(Rider.id == rider_id).first()
    if rider is None:
        raise HTTPException(status_code=404, detail="Rider not found")
    if current_user.role != ADMIN and not (current_user.role == RIDER and rider.user_id == current_user.id):
        raise HTTPException(status_code=403, detail="You can update only your rider profile")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rider, field, value)
    db.commit()
    db.refresh(rider)
    return rider
