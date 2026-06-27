from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.banner import Banner
from app.models.language import Language
from app.models.promotion import Promotion
from app.models.user import User
from app.schemas.support_schema import (
    BannerCreate,
    BannerResponse,
    LanguageCreate,
    LanguageResponse,
    PromotionCreate,
    PromotionResponse,
)


router = APIRouter(prefix="/content", tags=["Platform Content"])


@router.post("/promotions", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
def create_promotion(
    payload: PromotionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    promotion = Promotion(**payload.model_dump())
    db.add(promotion)
    db.commit()
    db.refresh(promotion)
    return promotion


@router.get("/promotions", response_model=list[PromotionResponse])
def list_promotions(db: Session = Depends(get_db)):
    return db.query(Promotion).filter(Promotion.is_active.is_(True)).order_by(Promotion.created_at.desc()).all()


@router.post("/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
def create_banner(
    payload: BannerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    banner = Banner(**payload.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.get("/banners", response_model=list[BannerResponse])
def list_banners(db: Session = Depends(get_db)):
    return db.query(Banner).filter(Banner.is_active.is_(True)).order_by(Banner.sort_order, Banner.created_at.desc()).all()


@router.post("/languages", response_model=LanguageResponse, status_code=status.HTTP_201_CREATED)
def create_language(
    payload: LanguageCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    language = Language(**payload.model_dump())
    db.add(language)
    db.commit()
    db.refresh(language)
    return language


@router.get("/languages", response_model=list[LanguageResponse])
def list_languages(db: Session = Depends(get_db)):
    return db.query(Language).filter(Language.is_active.is_(True)).order_by(Language.name).all()
