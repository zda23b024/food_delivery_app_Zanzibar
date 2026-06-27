from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.user_schema import UserResponse, UserUpdate


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
