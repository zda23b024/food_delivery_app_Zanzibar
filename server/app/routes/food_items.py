from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import bearer_scheme, get_current_user
from app.core.security import decode_access_token
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.food_item_schema import FoodItemCreate, FoodItemResponse, FoodItemUpdate
from app.services.storage_service import save_image_upload


router = APIRouter(prefix="/food-items", tags=["Food Menu"])


def ensure_restaurant_manager(db: Session, restaurant_id: str, user: User) -> Restaurant:
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if user.role != ADMIN and restaurant.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You can manage only your restaurant menu")
    return restaurant


@router.post("", response_model=FoodItemResponse, status_code=status.HTTP_201_CREATED)
def create_food_item(
    payload: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_restaurant_manager(db, payload.restaurant_id, current_user)
    item = FoodItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("", response_model=list[FoodItemResponse])
def search_food_items(
    q: str | None = Query(default=None),
    restaurant_id: str | None = None,
    category_id: str | None = None,
    include_unavailable: bool = False,
    db: Session = Depends(get_db),
    credentials=Depends(bearer_scheme),
):
    query = db.query(FoodItem).filter(FoodItem.is_active.is_(True))
    can_manage = False
    if include_unavailable and credentials is not None:
        try:
            payload = decode_access_token(credentials.credentials)
            user = db.query(User).filter(User.id == payload.get("sub"), User.is_active.is_(True)).first()
            if user and user.role == ADMIN:
                can_manage = True
            elif user and restaurant_id:
                can_manage = db.query(Restaurant).filter(Restaurant.id == restaurant_id, Restaurant.owner_id == user.id).first() is not None
        except ValueError:
            can_manage = False
    if not can_manage:
        query = query.filter(FoodItem.is_available.is_(True))
    if q:
        pattern = f"%{q}%"
        query = query.filter(or_(FoodItem.name.ilike(pattern), FoodItem.description.ilike(pattern)))
    if restaurant_id:
        query = query.filter(FoodItem.restaurant_id == restaurant_id)
    if category_id:
        query = query.filter(FoodItem.category_id == category_id)
    return query.order_by(FoodItem.is_featured.desc(), FoodItem.sort_order, FoodItem.name).all()


@router.get("/{food_item_id}", response_model=FoodItemResponse)
def get_food_item(food_item_id: str, db: Session = Depends(get_db)):
    item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    return item


@router.patch("/{food_item_id}", response_model=FoodItemResponse)
def update_food_item(
    food_item_id: str,
    payload: FoodItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    ensure_restaurant_manager(db, item.restaurant_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{food_item_id}", response_model=MessageResponse)
def delete_food_item(
    food_item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    ensure_restaurant_manager(db, item.restaurant_id, current_user)
    item.is_active = False
    db.commit()
    return MessageResponse(message="Food item deleted")


@router.post("/{food_item_id}/image", response_model=FoodItemResponse)
async def upload_food_image(
    food_item_id: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    ensure_restaurant_manager(db, item.restaurant_id, current_user)

    item.image_url = await save_image_upload(image, "food-items", food_item_id)
    db.commit()
    db.refresh(item)
    return item
