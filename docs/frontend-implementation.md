# ZanMeal Frontend Implementation

## Customer Web App

Location: `client/customer-web`

Framework: Next.js, React, TypeScript.

Pages implemented:

- `/` - Home page with restaurant discovery, search field, recommended meals, and cart summary.
- `/restaurants` - Restaurant listing and filters for Zanzibar areas, Pemba, hotel delivery, and beach delivery.
- `/restaurants/[id]` - Restaurant details page with menu items and add-to-cart actions.
- `/cart` - Cart page with quantity updates, remove item, subtotal, delivery fee, and total.
- `/checkout` - Checkout page with address, delivery type, phone number, and mobile money selection.
- `/orders` - Customer order tracking with statuses: Pending, Accepted, Preparing, Ready, Picked Up, Delivered, Cancelled.
- `/favorites` - Saved restaurants and meals.
- `/profile` - Customer profile, phone, loyalty points, verification, and saved addresses.
- `/settings` - Language, notification, and payment preferences.

Customer features implemented:

- Add items to cart.
- Remove items from cart.
- Update quantities.
- Calculate subtotal, delivery fee, and total.
- Persist cart in local storage.
- Mobile money payment UI for M-Pesa, Airtel Money, Tigo Pesa, and HaloPesa.
- Favorite toggles for restaurants and food items.
- Live tracking panel prepared for WebSocket order updates.
- Review composer prepared for food quality, delivery speed, rider professionalism, comments, and image upload.
- API helpers for Google Maps distance, route optimization, favorites, payments, reviews, and WebSocket tracking.
- Responsive desktop/mobile layout.
- Reusable restaurant, food, and cart components.
- API service wrapper prepared for the FastAPI backend.

## Rider Mobile App

Location: `mobile/rider-app`

Framework: Expo React Native, TypeScript.

Screens implemented:

- Login Screen
- Home Screen
- Available Orders Screen
- Accepted Orders Screen
- Navigation Screen
- Earnings Screen
- Profile Screen
- Settings Screen

Rider features implemented:

- Go online/offline.
- View available orders.
- Accept orders.
- View accepted orders.
- Start navigation.
- Complete delivery.
- Send live WebSocket rider location/status updates during navigation.
- Send REST delivery tracking updates to persist rider location/status.
- View earnings.
- View rider profile and settings.

Rider live tracking environment values:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8000/api/v1
EXPO_PUBLIC_TRACKING_ORDER_ID=<real-backend-order-id>
EXPO_PUBLIC_RIDER_ID=<real-backend-rider-id>
EXPO_PUBLIC_RIDER_TOKEN=<rider-jwt-access-token>
```

The customer web Orders page listens to the active backend order id through `/api/v1/live-tracking/orders/{order_id}`.

## Restaurant Dashboard

Location: `client/restaurant-dashboard`

Framework: Next.js, React, TypeScript.

Pages implemented:

- `/` - Overview
- `/login` - Restaurant owner login
- `/orders` - Order management
- `/menu` - Menu management
- `/menu/new` - Add food item
- `/menu/[id]` - Edit food item
- `/promotions` - Promotions
- `/earnings` - Revenue and payout summary
- `/profile` - Restaurant public profile
- `/settings` - Restaurant settings and logout

Verified:

```bash
npm.cmd run build
```

## Admin Dashboard

Location: `client/admin-dashboard`

Framework: Next.js, React, TypeScript.

Pages implemented:

- `/` - Platform overview
- `/login` - Admin login
- `/users` - User management
- `/restaurants` - Restaurant management
- `/riders` - Rider management
- `/orders` - Order monitoring
- `/payments` - Payment monitoring
- `/reviews` - Review monitoring
- `/content` - Promotions, banners, coupons, languages
- `/settings` - Admin settings

Verified:

```bash
npm.cmd run build
```

## Customer Mobile App

Location: `mobile/customer-app`

Framework: Expo React Native, TypeScript.

Screens implemented:

- Login/Register
- Home
- Restaurants
- Restaurant Details
- Cart
- Checkout
- Orders and tracking placeholder
- Favorites
- Profile
- Settings

## Next Frontend Step

Connect the UI to the FastAPI backend:

- Replace mock restaurant/menu/order data with API calls.
- Persist authentication tokens after login.
- Submit checkout orders to `/api/v1/orders`.
- Submit payments to `/api/v1/payments`.
- Connect rider actions to `/api/v1/orders/{id}/status` and `/api/v1/delivery-tracking`.
- Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` when running against a non-local backend.
