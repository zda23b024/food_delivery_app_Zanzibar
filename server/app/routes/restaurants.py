from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, RESTAURANT
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.restaurant_schema import RestaurantCreate, RestaurantResponse, RestaurantUpdate
from app.utils.helpers import slugify


router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RESTAURANT, ADMIN)),
):
    slug = payload.slug or slugify(payload.name)
    if db.query(Restaurant).filter(Restaurant.slug == slug).first():
        slug = f"{slug}-{current_user.id[:6]}"
    restaurant = Restaurant(**payload.model_dump(exclude={"slug"}), slug=slug, owner_id=current_user.id)
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("", response_model=list[RestaurantResponse])
def list_restaurants(
    q: str | None = Query(default=None),
    area: str | None = None,
    island: str | None = None,
    service_type: str | None = None,
    cuisine_type: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Restaurant).filter(Restaurant.is_active.is_(True))
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(Restaurant.name.ilike(pattern), Restaurant.description.ilike(pattern), Restaurant.cuisine_type.ilike(pattern))
        )
    if area:
        query = query.filter(Restaurant.area.ilike(f"%{area}%"))
    if island:
        query = query.filter(Restaurant.island == island)
    if service_type:
        query = query.filter(Restaurant.service_type == service_type)
    if cuisine_type:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine_type}%"))
    return query.order_by(Restaurant.average_rating.desc(), Restaurant.created_at.desc()).all()


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: str, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.patch("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: str,
    payload: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if current_user.role != ADMIN and restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can update only your restaurant")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(restaurant, field, value)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.delete("/{restaurant_id}", response_model=MessageResponse)
def delete_restaurant(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if current_user.role != ADMIN and restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can delete only your restaurant")
    restaurant.is_active = False
    db.commit()
    return MessageResponse(message="Restaurant deleted")
