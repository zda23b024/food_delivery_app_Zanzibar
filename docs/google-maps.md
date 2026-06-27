# Google Maps Integration

Backend support has been added for:

- Rider tracking coordinates.
- Distance calculations.
- ETA calculations.
- Route optimization.

Endpoints:

- `POST /api/v1/maps/distance`
- `POST /api/v1/maps/route-optimization`
- `GET /api/v1/maps/distance/local`

Configuration:

- Add `GOOGLE_MAPS_API_KEY` to the backend `.env` file.
- If no key is configured, the backend uses a local Haversine distance estimate and average-speed ETA.
