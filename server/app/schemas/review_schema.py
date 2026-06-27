from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    order_id: str
    restaurant_id: str
    rider_id: str | None = None
    food_rating: int = Field(..., ge=1, le=5)
    delivery_rating: int | None = Field(default=None, ge=1, le=5)
    restaurant_rating: int | None = Field(default=None, ge=1, le=5)
    rider_rating: int | None = Field(default=None, ge=1, le=5)
    overall_rating: int = Field(..., ge=1, le=5)
    comment: str | None = None
    image_url: str | None = None


class ReviewResponse(ReviewCreate):
    id: str
    customer_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
