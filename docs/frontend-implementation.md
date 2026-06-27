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
- View earnings.
- View rider profile and settings.

## Next Frontend Step

Connect the UI to the FastAPI backend:

- Replace mock restaurant/menu/order data with API calls.
- Persist authentication tokens after login.
- Submit checkout orders to `/api/v1/orders`.
- Submit payments to `/api/v1/payments`.
- Connect rider actions to `/api/v1/orders/{id}/status` and `/api/v1/delivery-tracking`.
- Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` when running against a non-local backend.
