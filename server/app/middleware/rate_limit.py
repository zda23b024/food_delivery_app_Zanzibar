import time
from collections import defaultdict, deque

from fastapi import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        if not settings.rate_limit_enabled:
            return await call_next(request)
        if request.url.path == "/health" or request.method == "OPTIONS":
            return await call_next(request)

        now = time.time()
        window_start = now - settings.rate_limit_window_seconds
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.url.path}"
        history = self.requests[key]
        while history and history[0] < window_start:
            history.popleft()
        if len(history) >= settings.rate_limit_requests:
            return JSONResponse(
                {"detail": "Too many requests. Please try again shortly."},
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        history.append(now)
        return await call_next(request)
