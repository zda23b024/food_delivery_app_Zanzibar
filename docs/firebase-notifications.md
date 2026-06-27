# Firebase Cloud Messaging

Backend support has been added for:

- Order confirmations.
- Delivery updates.
- Rider assignment notifications.
- Promotional campaign notifications.

Endpoint:

- `POST /api/v1/notifications/push/test`

Configuration:

- Create a Firebase service account JSON file.
- Add `FIREBASE_CREDENTIALS_PATH` to the backend `.env` file.
- If Firebase is not configured, the notification service returns a safe `firebase_not_configured` response instead of crashing.
