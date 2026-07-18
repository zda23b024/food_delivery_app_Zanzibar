from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.roles import ADMIN
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.notification import Notification
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.support_schema import NotificationCreate, NotificationResponse
from app.services.notification_service import send_push_notification


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ADMIN)),
):
    notification = Notification(**payload.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/me", response_model=list[NotificationResponse])
def my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()


@router.patch("/{notification_id}/read", response_model=MessageResponse)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id and current_user.role != ADMIN:
        raise HTTPException(status_code=403, detail="You cannot update this notification")
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    return MessageResponse(message="Notification marked as read")


@router.post("/push/test")
def test_push_notification(
    device_token: str,
    title: str = "Zanmart notification",
    body: str = "Firebase Cloud Messaging is ready.",
    _: User = Depends(require_roles(ADMIN)),
):
    return send_push_notification(device_token=device_token, title=title, body=body)
