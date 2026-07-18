from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.address import Address
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.support_schema import AddressCreate, AddressResponse


router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = Address(**payload.model_dump(), user_id=current_user.id)
    if address.is_default:
        db.query(Address).filter(Address.user_id == current_user.id, Address.is_default.is_(True)).update(
            {"is_default": False}
        )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.get("/me", response_model=list[AddressResponse])
def my_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.created_at.desc()).all()


@router.delete("/{address_id}", response_model=MessageResponse)
def delete_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(address)
    db.commit()
    return MessageResponse(message="Address deleted")
