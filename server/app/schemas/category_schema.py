from datetime import datetime

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    parent_id: str | None = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    parent_id: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: str
    parent_id: str | None = None
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
