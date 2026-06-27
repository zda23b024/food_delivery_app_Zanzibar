from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.maps_service import calculate_distance_km, estimate_eta_minutes, get_google_distance_matrix, optimize_route


router = APIRouter(prefix="/maps", tags=["Google Maps"])


class DistanceRequest(BaseModel):
    origin_latitude: float
    origin_longitude: float
    destination_latitude: float
    destination_longitude: float
    preparation_minutes: int = 0


class RouteStop(BaseModel):
    label: str
    latitude: float
    longitude: float


class RouteOptimizationRequest(BaseModel):
    stops: list[RouteStop] = Field(..., min_length=2)


@router.post("/distance")
async def distance(payload: DistanceRequest):
    result = await get_google_distance_matrix(
        payload.origin_latitude,
        payload.origin_longitude,
        payload.destination_latitude,
        payload.destination_longitude,
    )
    if payload.preparation_minutes:
        result["eta_minutes"] = estimate_eta_minutes(result["distance_km"], prep_minutes=payload.preparation_minutes)
    return result


@router.post("/route-optimization")
async def route_optimization(payload: RouteOptimizationRequest):
    return await optimize_route([stop.model_dump() for stop in payload.stops])


@router.get("/distance/local")
def local_distance(origin_latitude: float, origin_longitude: float, destination_latitude: float, destination_longitude: float):
    distance_km = calculate_distance_km(origin_latitude, origin_longitude, destination_latitude, destination_longitude)
    return {"distance_km": distance_km, "eta_minutes": estimate_eta_minutes(distance_km)}
