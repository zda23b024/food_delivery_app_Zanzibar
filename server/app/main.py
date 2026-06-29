from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.middleware.audit import AuditLogMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import (
    addresses,
    analytics,
    auth,
    categories,
    content,
    coupons,
    delivery_tracking,
    favorites,
    food_items,
    live_tracking,
    maps,
    notifications,
    orders,
    payments,
    restaurants,
    reviews,
    riders,
    users,
)


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Backend API for the ZanMeal Zanzibar food delivery ecosystem.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuditLogMiddleware)
app.add_middleware(RateLimitMiddleware)

upload_root = Path(settings.storage_local_root)
upload_root.mkdir(parents=True, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=str(upload_root)), name="uploads")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.app_name}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(addresses.router, prefix=settings.api_prefix)
app.include_router(restaurants.router, prefix=settings.api_prefix)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(food_items.router, prefix=settings.api_prefix)
app.include_router(orders.router, prefix=settings.api_prefix)
app.include_router(payments.router, prefix=settings.api_prefix)
app.include_router(riders.router, prefix=settings.api_prefix)
app.include_router(maps.router, prefix=settings.api_prefix)
app.include_router(live_tracking.router, prefix=settings.api_prefix)
app.include_router(delivery_tracking.router, prefix=settings.api_prefix)
app.include_router(reviews.router, prefix=settings.api_prefix)
app.include_router(favorites.router, prefix=settings.api_prefix)
app.include_router(notifications.router, prefix=settings.api_prefix)
app.include_router(coupons.router, prefix=settings.api_prefix)
app.include_router(content.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)
