from math import atan2, cos, radians, sin, sqrt

import httpx

from app.core.config import settings


TOWN_AREAS = [
    {"name": "Stone Town", "latitude": -6.1606, "longitude": 39.1910},
    {"name": "Malindi", "latitude": -6.1568, "longitude": 39.1930},
    {"name": "Vuga", "latitude": -6.1653, "longitude": 39.1918},
    {"name": "Kijangwani", "latitude": -6.1618, "longitude": 39.1934},
    {"name": "Darajani", "latitude": -6.1627, "longitude": 39.1935},
    {"name": "Michenzani", "latitude": -6.1668, "longitude": 39.2036},
    {"name": "Mlandege", "latitude": -6.1590, "longitude": 39.1998},
]


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


def local_distance_response(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float, reason: str | None = None) -> dict:
    distance_km = calculate_distance_km(origin_lat, origin_lng, dest_lat, dest_lng)
    response = {
        "provider": "local_estimate",
        "distance_km": distance_km,
        "eta_minutes": estimate_eta_minutes(distance_km),
    }
    if reason:
        response["fallback_reason"] = reason
    return response


async def get_google_distance_matrix(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> dict:
    if not settings.google_maps_api_key:
        return local_distance_response(origin_lat, origin_lng, dest_lat, dest_lng, "google_maps_api_key_missing")

    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "key": settings.google_maps_api_key,
        "mode": "driving",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("https://maps.googleapis.com/maps/api/distancematrix/json", params=params)
            response.raise_for_status()
            data = response.json()
        element = data["rows"][0]["elements"][0]
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return local_distance_response(origin_lat, origin_lng, dest_lat, dest_lng, "google_maps_unavailable")

    if element.get("status") != "OK":
        return local_distance_response(origin_lat, origin_lng, dest_lat, dest_lng, f"google_maps_{element.get('status', 'invalid_response').lower()}")

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


def nearest_town_area(latitude: float, longitude: float) -> dict:
    nearest = min(
        TOWN_AREAS,
        key=lambda area: calculate_distance_km(latitude, longitude, area["latitude"], area["longitude"]),
    )
    distance_km = calculate_distance_km(latitude, longitude, nearest["latitude"], nearest["longitude"])
    return {
        "area": nearest["name"],
        "city": "Zanzibar City",
        "island": "Unguja",
        "distance_to_area_km": distance_km,
        "formatted_address": f"Near {nearest['name']}, Zanzibar City, Unguja",
        "provider": "local_town_area",
    }


async def reverse_geocode(latitude: float, longitude: float) -> dict:
    local = nearest_town_area(latitude, longitude)
    if not settings.google_maps_api_key:
        return local | {"fallback_reason": "google_maps_api_key_missing"}

    params = {"latlng": f"{latitude},{longitude}", "key": settings.google_maps_api_key}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("https://maps.googleapis.com/maps/api/geocode/json", params=params)
            response.raise_for_status()
            data = response.json()
        result = data.get("results", [{}])[0]
        formatted_address = result.get("formatted_address")
        components = result.get("address_components", [])
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return local | {"fallback_reason": "google_maps_unavailable"}

    if not formatted_address:
        return local | {"fallback_reason": "google_maps_no_address"}

    area = local["area"]
    city = "Zanzibar City"
    for component in components:
      types = component.get("types", [])
      if any(item in types for item in ["neighborhood", "sublocality", "sublocality_level_1"]):
          area = component.get("long_name") or area
      if "locality" in types:
          city = component.get("long_name") or city

    return {
        **local,
        "provider": "google_maps",
        "formatted_address": formatted_address,
        "area": area,
        "city": city,
        "raw": data,
    }
