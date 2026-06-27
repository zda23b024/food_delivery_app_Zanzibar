from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.support_schema import CouponCreate, CouponResponse


router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    payload: CouponCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("", response_model=list[CouponResponse])
def list_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).filter(Coupon.is_active.is_(True)).order_by(Coupon.created_at.desc()).all()
