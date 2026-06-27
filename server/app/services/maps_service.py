from math import atan2, cos, radians, sin, sqrt

import httpx

from app.core.config import settings


def calculate_distance_km(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> float:
    earth_radius_km = 6371.0
    d_lat = radians(dest_lat - origin_lat)
    d_lng = radians(dest_lng - origin_lng)
    lat1 = radians(origin_lat)
    lat2 = radians(dest_lat)
    a = sin(d_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(d_lng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return round(earth_radius_km * c, 2)


def estimate_eta_minutes(distance_km: float, average_speed_kmh: float = 24.0, prep_minutes: int = 0) -> int:
    if average_speed_kmh <= 0:
        average_speed_kmh = 24.0
    travel_minutes = (distance_km / average_speed_kmh) * 60
    return max(1, round(travel_minutes + prep_minutes))


async def get_google_distance_matrix(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> dict:
    if not settings.google_maps_api_key:
        distance_km = calculate_distance_km(origin_lat, origin_lng, dest_lat, dest_lng)
        return {
            "provider": "local_estimate",
            "distance_km": distance_km,
            "eta_minutes": estimate_eta_minutes(distance_km),
        }

    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "key": settings.google_maps_api_key,
        "mode": "driving",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get("https://maps.googleapis.com/maps/api/distancematrix/json", params=params)
        response.raise_for_status()
        data = response.json()

    element = data["rows"][0]["elements"][0]
    return {
        "provider": "google_maps",
        "distance_km": round(element["distance"]["value"] / 1000, 2),
        "eta_minutes": round(element["duration"]["value"] / 60),
        "raw": data,
    }


async def optimize_route(stops: list[dict]) -> dict:
    if len(stops) < 2:
        return {"provider": "local_estimate", "stops": stops, "total_distance_km": 0, "eta_minutes": 0}

    ordered = [stops[0]]
    remaining = stops[1:]
    total_distance = 0.0

    while remaining:
        current = ordered[-1]
        next_stop = min(
            remaining,
            key=lambda stop: calculate_distance_km(current["latitude"], current["longitude"], stop["latitude"], stop["longitude"]),
        )
        total_distance += calculate_distance_km(
            current["latitude"],
            current["longitude"],
            next_stop["latitude"],
            next_stop["longitude"],
        )
        ordered.append(next_stop)
        remaining.remove(next_stop)

    return {
        "provider": "local_nearest_neighbor",
        "stops": ordered,
        "total_distance_km": round(total_distance, 2),
        "eta_minutes": estimate_eta_minutes(total_distance),
    }
