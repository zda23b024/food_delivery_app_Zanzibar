from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.constants.roles import CUSTOMER
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.favorite import Favorite
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.common import MessageResponse


router = APIRouter(prefix="/favorites", tags=["Favorites"])


class FavoriteCreate(BaseModel):
    restaurant_id: str | None = None
    food_item_id: str | None = None


@router.post("", status_code=status.HTTP_201_CREATED)
def save_favorite(
    payload: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(CUSTOMER)),
):
    if bool(payload.restaurant_id) == bool(payload.food_item_id):
        raise HTTPException(status_code=400, detail="Send exactly one of restaurant_id or food_item_id")
    if payload.restaurant_id and not db.query(Restaurant).filter(
        Restaurant.id == payload.restaurant_id,
        Restaurant.is_active.is_(True),
    ).first():
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if payload.food_item_id and not db.query(FoodItem).filter(
        FoodItem.id == payload.food_item_id,
        FoodItem.is_active.is_(True),
    ).first():
        raise HTTPException(status_code=404, detail="Food item not found")

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == payload.restaurant_id,
            Favorite.food_item_id == payload.food_item_id,
        )
        .first()
    )
    if existing:
        return existing

    favorite = Favorite(**payload.model_dump(), user_id=current_user.id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@router.get("")
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(CUSTOMER)),
):
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).order_by(Favorite.created_at.desc()).all()


@router.delete("/{favorite_id}", response_model=MessageResponse)
def remove_favorite(
    favorite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = db.query(Favorite).filter(Favorite.id == favorite_id, Favorite.user_id == current_user.id).first()
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(favorite)
    db.commit()
    return MessageResponse(message="Favorite removed")
