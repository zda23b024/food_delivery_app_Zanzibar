# ZanMeal Database Design

This schema starts the ZanMeal MVP while leaving space for the Zanzibar-specific gaps in the proposal: tourist delivery, hotel/beach delivery, Pemba and rural coverage, multilingual support, loyalty, promotions, analytics, and future grocery/pharmacy/logistics services.

## Core Tables

### users
Stores every platform account: customers, restaurant owners, riders, and admins.

Important fields: `full_name`, `email`, `phone_number`, `password_hash`, `role`, `preferred_language`, verification flags, `last_login_at`.

### restaurants
Stores restaurant/vendor profiles. The `service_type` field allows the platform to grow beyond food into grocery, pharmacy, fish market, spice market, water, gas, and parcel partners.

Important fields: owner, name, slug, contact details, cuisine, location, island, delivery fee, commission rate, rating summary, open/closed status, hotel delivery, beach delivery, tourist delivery.

### categories
Stores menu and service categories, including nested categories.

Examples: Local Food, Seafood, Drinks, Grocery, Pharmacy, Fish Market, Spice Market.

### food_items
Stores menu/products sold by a restaurant/vendor.

Important fields: restaurant, category, name, description, image, price, discount price, preparation time, availability, halal, vegetarian, spice level.

### orders
Stores customer orders.

Important fields: customer, restaurant, rider, address, coupon, order number, status, service type, delivery type, payment method, subtotal, fees, discount, tax, total, notes, estimated and actual workflow timestamps.

### order_items
Stores the individual items inside an order, including a price snapshot so historical orders remain accurate even if menu prices change.

### payments
Stores payment intent/result per order.

Supported methods can include `mpesa`, `tigo_pesa`, `airtel_money`, `halopesa`, `pbz`, `visa`, `mastercard`, and `cash_on_delivery`.

### riders
Stores rider operational profile.

Important fields: vehicle info, service area, island, live coordinates, online/availability state, rating summary, total deliveries, earnings.

### delivery_tracking
Stores delivery status and GPS events for live tracking and ETA history.

### reviews
Stores customer reviews after completed orders, including food, restaurant, delivery, rider, and overall ratings.

## Added Important Tables

### addresses
Supports saved customer delivery locations, landmarks, islands, hotel/beach instructions, and precise coordinates.

### coupons
Supports launch offers, tourist discounts, student promotions, first-order offers, and campaign tracking.

### favorites
Supports saved restaurants and food items for faster repeat ordering.

### notifications
Supports push/SMS/email/in-app messages for order updates, promotions, and admin notices.

### loyalty_points
Supports retention through points earned and redeemed by customers.

### languages
Supports English, Kiswahili, Arabic, Hindi, and future tourist languages. Includes RTL support for Arabic.

### promotions
Supports sponsored listings, smart promotions, featured restaurants, and vendor campaigns.

### advertisement_banners
Supports homepage/category promotional placements and ad revenue.

### transactions
Stores payment provider events, refunds, and wallet-style financial records.

### restaurant_analytics
Stores daily restaurant performance summaries for dashboards and future AI demand prediction.

## Main Relationships

- One `User` can have many `Address`, `Order`, `Review`, `Favorite`, `Notification`, and `LoyaltyPoint` records.
- One `User` can have one `Rider` profile.
- One `User` can own many `Restaurant` records.
- One `Restaurant` has many `FoodItem`, `Order`, `Review`, and `RestaurantAnalytics` records.
- One `Order` has many `OrderItem` and `DeliveryTracking` records.
- One `Order` has one `Payment`.
- One `Payment` can have many `Transaction` records.
- One `Rider` can handle many `Order` and `DeliveryTracking` records.

## Creating Tables

Preferred migration flow from the `server` directory:

```bash
alembic upgrade head
```

Quick SQLite development fallback:

```bash
python -m app.db_init
```

## Zanzibar Gap Coverage

- Pemba and rural coverage: `island`, `area`, `service_area`, and coordinates across restaurants, addresses, and riders.
- Tourism support: restaurant flags for tourist, hotel, and beach delivery plus delivery notes in addresses/orders.
- Multi-service future: `service_type` on restaurants and orders.
- AI readiness: analytics, timestamps, status history, ratings, favorites, and loyalty data.
- Fraud/payment monitoring: payments and transactions with provider references and statuses.
