from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.analytics import RestaurantAnalytics
from app.models.user import User


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/restaurants")
def restaurant_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    return db.query(RestaurantAnalytics).order_by(RestaurantAnalytics.report_date.desc()).all()
