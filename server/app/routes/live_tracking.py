from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter(prefix="/live-tracking", tags=["Live Tracking"])


class ConnectionManager:
    def __init__(self) -> None:
        self.order_connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, order_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.order_connections[order_id].append(websocket)

    def disconnect(self, order_id: str, websocket: WebSocket) -> None:
        if websocket in self.order_connections[order_id]:
            self.order_connections[order_id].remove(websocket)

    async def broadcast(self, order_id: str, message: dict) -> None:
        disconnected: list[WebSocket] = []
        for connection in self.order_connections[order_id]:
            try:
                await connection.send_json(message)
            except RuntimeError:
                disconnected.append(connection)
        for connection in disconnected:
            self.disconnect(order_id, connection)


manager = ConnectionManager()


@router.websocket("/orders/{order_id}")
async def order_tracking_socket(websocket: WebSocket, order_id: str):
    await manager.connect(order_id, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            event = {
                "order_id": order_id,
                "type": payload.get("type", "location_update"),
                "status": payload.get("status"),
                "latitude": payload.get("latitude"),
                "longitude": payload.get("longitude"),
                "eta_minutes": payload.get("eta_minutes"),
                "message": payload.get("message"),
                "sent_at": datetime.utcnow().isoformat(),
            }
            await manager.broadcast(order_id, event)
    except WebSocketDisconnect:
        manager.disconnect(order_id, websocket)
