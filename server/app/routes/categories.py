from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.category import Category
from app.models.user import User
from app.schemas.category_schema import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import MessageResponse
from app.utils.helpers import slugify


router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    slug = payload.slug or slugify(payload.name)
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(status_code=409, detail="Category slug already exists")
    category = Category(**payload.model_dump(exclude={"slug"}), slug=slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active.is_(True)).order_by(Category.sort_order, Category.name).all()


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", response_model=MessageResponse)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    category.is_active = False
    db.commit()
    return MessageResponse(message="Category deleted")
