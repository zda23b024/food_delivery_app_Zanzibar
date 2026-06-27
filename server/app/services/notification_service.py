from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, messaging

from app.core.config import settings


@lru_cache
def get_firebase_app():
    if not settings.firebase_credentials_path:
        return None
    if firebase_admin._apps:
        return firebase_admin.get_app()
    cred = credentials.Certificate(settings.firebase_credentials_path)
    return firebase_admin.initialize_app(cred)


def send_push_notification(
    device_token: str,
    title: str,
    body: str,
    data: dict[str, str] | None = None,
) -> dict:
    app = get_firebase_app()
    if app is None:
        return {
            "provider": "firebase_not_configured",
            "queued": False,
            "title": title,
            "body": body,
            "data": data or {},
        }

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        token=device_token,
    )
    message_id = messaging.send(message, app=app)
    return {"provider": "firebase", "message_id": message_id, "queued": True}


def build_order_notification(order_id: str, status: str) -> tuple[str, str, dict[str, str]]:
    title = "ZanMeal order update"
    body = f"Your order {order_id} is now {status}."
    return title, body, {"order_id": order_id, "status": status}
