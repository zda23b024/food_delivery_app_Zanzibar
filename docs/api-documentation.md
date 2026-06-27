# ZanMeal Backend API

Base URL: `/api/v1`

## Authentication

- `POST /auth/register` - create customer, restaurant, rider, or admin account.
- `POST /auth/login` - login with phone number and password.
- `POST /auth/refresh` - rotate refresh token and issue a new access token.
- `POST /auth/logout` - revoke a refresh token.
- `GET /auth/me` - get the authenticated user profile.

Security:

- Passwords are hashed with bcrypt.
- Access tokens use JWT.
- Refresh tokens are stored server-side and can be revoked on logout.
- Role-based access control supports `customer`, `restaurant`, `rider`, and `admin`.

## Restaurants

- `POST /restaurants` - create restaurant. Roles: restaurant, admin.
- `GET /restaurants` - search restaurants by text, area, island, service type, or cuisine.
- `GET /restaurants/{restaurant_id}` - view restaurant details.
- `PATCH /restaurants/{restaurant_id}` - update restaurant. Owner or admin.
- `DELETE /restaurants/{restaurant_id}` - soft delete restaurant. Owner or admin.

## Categories

- `POST /categories` - add category. Admin.
- `GET /categories` - list active categories.
- `PATCH /categories/{category_id}` - update category. Admin.
- `DELETE /categories/{category_id}` - soft delete category. Admin.

## Food Menu

- `POST /food-items` - add menu item. Restaurant owner or admin.
- `GET /food-items` - search menu items.
- `GET /food-items/{food_item_id}` - view item details.
- `PATCH /food-items/{food_item_id}` - edit menu item. Restaurant owner or admin.
- `DELETE /food-items/{food_item_id}` - soft delete menu item. Restaurant owner or admin.
- `POST /food-items/{food_item_id}/image` - upload JPG, PNG, or WEBP food image.

## Orders

- `POST /orders` - customer creates order.
- `GET /orders` - list orders scoped by user role.
- `GET /orders/{order_id}` - view order details.
- `PATCH /orders/{order_id}/status` - update order workflow status.

## Other Core Modules

- `POST /payments`, `PATCH /payments/{payment_id}`
- `POST /riders`, `GET /riders`, `PATCH /riders/{rider_id}`
- `POST /maps/distance` - Google Maps distance and ETA, with local estimate fallback.
- `POST /maps/route-optimization` - route ordering for multiple delivery stops.
- `GET /maps/distance/local` - local distance and ETA calculation without Google API key.
- `WS /live-tracking/orders/{order_id}` - WebSocket for real-time rider location and order status updates.
- `POST /delivery-tracking`, `GET /delivery-tracking/order/{order_id}`
- `POST /reviews`, `GET /reviews/restaurant/{restaurant_id}`
- `POST /reviews/{review_id}/image` - upload review image.
- `POST /favorites`, `GET /favorites`, `DELETE /favorites/{favorite_id}`
- `POST /addresses`, `GET /addresses/me`, `DELETE /addresses/{address_id}`
- `POST /coupons`, `GET /coupons`
- `POST /notifications`, `GET /notifications/me`, `PATCH /notifications/{notification_id}/read`
- `POST /notifications/push/test` - Firebase Cloud Messaging test endpoint.
- `POST /content/promotions`, `GET /content/promotions`
- `POST /content/banners`, `GET /content/banners`
- `POST /content/languages`, `GET /content/languages`
- `GET /analytics/restaurants`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string.
- `SECRET_KEY` - JWT access token secret.
- `REFRESH_SECRET_KEY` - JWT refresh token secret.
- `GOOGLE_MAPS_API_KEY` - optional. If missing, local distance and ETA estimates are used.
- `FIREBASE_CREDENTIALS_PATH` - optional path to Firebase service account JSON. If missing, push requests return a safe not-configured response.
