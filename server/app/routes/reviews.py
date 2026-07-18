from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN, CUSTOMER
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.review import Review
from app.schemas.common import MessageResponse
from app.models.user import User
from app.schemas.review_schema import ReviewCreate, ReviewResponse
from app.services.storage_service import save_image_upload


router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=list[ReviewResponse])
def list_reviews(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(CUSTOMER)),
):
    review = Review(**payload.model_dump(), customer_id=current_user.id)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/restaurant/{restaurant_id}", response_model=list[ReviewResponse])
def list_restaurant_reviews(restaurant_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.restaurant_id == restaurant_id).order_by(Review.created_at.desc()).all()


@router.post("/{review_id}/image", response_model=ReviewResponse)
async def upload_review_image(
    review_id: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(CUSTOMER)),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can update only your review")

    review.image_url = await save_image_upload(image, "reviews", review_id)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}", response_model=MessageResponse)
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
