from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.constants.roles import ADMIN as ADMIN_ROLE, CUSTOMER, RESTAURANT, RIDER
from app.schemas.user_schema import UserAdminUpdate, UserResponse, UserUpdate


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = payload.model_dump(exclude_unset=True)
    role = update_data.get("role")
    if role is not None and role not in {CUSTOMER, RESTAURANT, RIDER, ADMIN_ROLE}:
        raise HTTPException(status_code=400, detail="Invalid user role")
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
