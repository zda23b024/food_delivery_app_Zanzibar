# ZanMeal

ZanMeal is a Zanzibar-first food delivery ecosystem with a FastAPI backend, Next.js customer web app, and Expo rider mobile app.

## Apps

- `server` - FastAPI backend with authentication, restaurants, categories, food menu, orders, payments, riders, tracking, reviews, notifications, coupons, content, and analytics.
- `client/customer-web` - Customer web application with home, restaurants, restaurant details, cart, checkout, orders, favorites, profile, and settings.
- `client/restaurant-dashboard` - Restaurant owner dashboard for orders, menu, promotions, earnings, profile, and settings.
- `client/admin-dashboard` - Platform admin dashboard for users, restaurants, riders, orders, payments, reviews, content, and analytics.
- `mobile/customer-app` - Expo customer mobile app for browsing, cart, checkout, orders, tracking, favorites, profile, and settings.
- `mobile/rider-app` - Rider mobile app with login, home, available orders, accepted orders, navigation, earnings, profile, and settings.

## Frontend Start Commands

Customer web:

```bash
cd client/customer-web
npm install
npm run dev
```

Restaurant dashboard:

```bash
cd client/restaurant-dashboard
npm install
npm run dev
```

Admin dashboard:

```bash
cd client/admin-dashboard
npm install
npm run dev
```

Customer mobile app:

```bash
cd mobile/customer-app
npm install
npm run start
```

Rider app:

```bash
cd mobile/rider-app
npm install
npm run start
```

## Backend Database Setup

From `server`:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

For quick local SQLite development, this also creates tables from the SQLAlchemy models:

```bash
python -m app.db_init
```
