import logging

from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.audit_log import AuditLog


logger = logging.getLogger("zanmeal.audit")


class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if not settings.audit_log_enabled or request.method in {"GET", "OPTIONS", "HEAD"}:
            return response
        if not request.url.path.startswith(settings.api_prefix):
            return response

        user_id = None
        role = None
        authorization = request.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1]
            try:
                payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
                user_id = payload.get("sub")
                role = payload.get("role")
            except JWTError:
                pass

        db = SessionLocal()
        try:
            db.add(
                AuditLog(
                    user_id=user_id,
                    role=role,
                    method=request.method,
                    path=request.url.path,
                    status_code=response.status_code,
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                    action=f"{request.method} {request.url.path}",
                )
            )
            db.commit()
        except Exception:
            db.rollback()
            logger.exception("Could not write audit log")
        finally:
            db.close()
        return response
