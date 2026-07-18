from decimal import Decimal

from app.constants.order_status import ACCEPTED, PREPARING
from app.constants.payment_status import COD_PENDING, PAID
from app.constants.roles import ADMIN, CUSTOMER, RESTAURANT, RIDER
from tests.conftest import login_user, register_user


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_auth_register_login_refresh_logout_and_me(client):
    register_user(client, CUSTOMER, "+255700000101", "customer101@example.com")
    headers, token_data = login_user(client, "+255700000101")

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == CUSTOMER

    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": token_data["refresh_token"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]

    logout = client.post("/api/v1/auth/logout", json={"refresh_token": refreshed.json()["refresh_token"]})
    assert logout.status_code == 200
    assert logout.json()["message"] == "Logged out"


def test_auth_allows_multiple_users_without_email(client):
    first = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "No Email One",
            "phone_number": "+255700009001",
            "preferred_language": "en",
            "password": "Password123",
            "role": CUSTOMER,
        },
    )
    assert first.status_code == 201, first.text
    second = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "No Email Two",
            "phone_number": "+255700009002",
            "preferred_language": "en",
            "password": "Password123",
            "role": CUSTOMER,
        },
    )
    assert second.status_code == 201, second.text


def test_customer_successful_order_and_payment_flow(client):
    register_user(client, CUSTOMER, "+255700000151", "customer151@example.com")
    register_user(client, RESTAURANT, "+255700000152", "owner152@example.com")
    register_user(client, ADMIN, "+255700000153", "admin153@example.com")

    customer_headers, _ = login_user(client, "+255700000151")
    owner_headers, _ = login_user(client, "+255700000152")
    admin_headers, _ = login_user(client, "+255700000153")

    profile = client.get("/api/v1/auth/me", headers=customer_headers)
    assert profile.status_code == 200
    assert profile.json()["phone_number"] == "+255700000151"
    assert profile.json()["role"] == CUSTOMER

    category = client.post(
        "/api/v1/categories",
        json={"name": "Customer Flow Meals", "description": "Checkout test category"},
        headers=admin_headers,
    )
    assert category.status_code == 201, category.text

    restaurant = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Customer Flow Kitchen",
            "service_type": "restaurant",
            "phone_number": "+255777151152",
            "address": "Mlandege Road",
            "area": "Mlandege",
            "city": "Zanzibar",
            "island": "Unguja",
            "latitude": -6.164,
            "longitude": 39.199,
            "min_order_amount": "5000",
            "delivery_fee": "2000",
            "commission_rate": "15",
        },
        headers=owner_headers,
    )
    assert restaurant.status_code == 201, restaurant.text

    food_item = client.post(
        "/api/v1/food-items",
        json={
            "restaurant_id": restaurant.json()["id"],
            "category_id": category.json()["id"],
            "name": "Customer Flow Pilau",
            "price": "12000",
            "preparation_time_minutes": 20,
            "is_available": True,
        },
        headers=owner_headers,
    )
    assert food_item.status_code == 201, food_item.text

    address = client.post(
        "/api/v1/addresses",
        json={
            "label": "Home",
            "street_address": "Kariakoo Zanzibar",
            "area": "Stone Town",
            "city": "Zanzibar",
            "island": "Unguja",
            "latitude": -6.161,
            "longitude": 39.192,
            "delivery_notes": "Call before arrival",
            "is_default": True,
        },
        headers=customer_headers,
    )
    assert address.status_code == 201, address.text
    assert address.json()["is_default"] is True

    saved_addresses = client.get("/api/v1/addresses/me", headers=customer_headers)
    assert saved_addresses.status_code == 200
    assert saved_addresses.json()[0]["id"] == address.json()["id"]

    order = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": restaurant.json()["id"],
            "delivery_address_id": address.json()["id"],
            "payment_method": "M-Pesa",
            "delivery_type": "standard",
            "service_type": "food",
            "customer_notes": "Please pack well",
            "items": [{"food_item_id": food_item.json()["id"], "quantity": 2}],
        },
        headers=customer_headers,
    )
    assert order.status_code == 201, order.text
    assert order.json()["status"] == "pending"
    assert order.json()["customer_id"] == profile.json()["id"]
    assert Decimal(order.json()["total_amount"]) == Decimal("26000.00")

    payment = client.post(
        "/api/v1/payments",
        json={
            "order_id": order.json()["id"],
            "method": "M-Pesa",
            "provider": "M-Pesa",
            "phone_number": "+255700000151",
        },
        headers=customer_headers,
    )
    assert payment.status_code == 201, payment.text
    assert payment.json()["order_id"] == order.json()["id"]
    assert payment.json()["provider"] == "mpesa"
    assert payment.json()["status"] == "processing"
    assert payment.json()["checkout_reference"]

    order_history = client.get("/api/v1/orders", headers=customer_headers)
    assert order_history.status_code == 200
    assert order_history.json()[0]["id"] == order.json()["id"]
    assert order_history.json()[0]["items"][0]["food_item_id"] == food_item.json()["id"]


def test_main_marketplace_flow_endpoint_by_endpoint(client):
    customer = register_user(client, CUSTOMER, "+255700000201", "customer201@example.com")
    restaurant_owner = register_user(client, RESTAURANT, "+255700000202", "owner202@example.com")
    rider_user = register_user(client, RIDER, "+255700000203", "rider203@example.com")
    register_user(client, ADMIN, "+255700000204", "admin204@example.com")

    customer_headers, _ = login_user(client, "+255700000201")
    owner_headers, _ = login_user(client, "+255700000202")
    rider_headers, _ = login_user(client, "+255700000203")
    admin_headers, _ = login_user(client, "+255700000204")

    denied_category = client.post(
        "/api/v1/categories",
        json={"name": "Seafood", "description": "Fresh fish"},
        headers=customer_headers,
    )
    assert denied_category.status_code == 403

    category = client.post(
        "/api/v1/categories",
        json={"name": "Seafood", "description": "Fresh fish", "sort_order": 1},
        headers=admin_headers,
    )
    assert category.status_code == 201, category.text
    category_id = category.json()["id"]

    categories = client.get("/api/v1/categories")
    assert categories.status_code == 200
    assert len(categories.json()) == 1

    restaurant = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Stone Grill Test",
            "description": "Swahili seafood and pilau",
            "service_type": "restaurant",
            "phone_number": "+255777111222",
            "email": "stonegrill@example.com",
            "cuisine_type": "Swahili BBQ",
            "address": "Mkunazini Street",
            "area": "Stone Town",
            "city": "Zanzibar",
            "island": "Unguja",
            "latitude": -6.162,
            "longitude": 39.192,
            "min_order_amount": "10000",
            "delivery_fee": "2500",
            "commission_rate": "15",
            "accepts_cash": True,
            "accepts_mobile_money": True,
            "supports_tourist_delivery": True,
            "supports_hotel_delivery": True,
            "supports_beach_delivery": False,
        },
        headers=owner_headers,
    )
    assert restaurant.status_code == 201, restaurant.text
    restaurant_id = restaurant.json()["id"]

    restaurant_search = client.get("/api/v1/restaurants?q=Stone")
    assert restaurant_search.status_code == 200
    assert restaurant_search.json()[0]["id"] == restaurant_id

    restaurant_detail = client.get(f"/api/v1/restaurants/{restaurant_id}")
    assert restaurant_detail.status_code == 200
    assert restaurant_detail.json()["name"] == "Stone Grill Test"

    food_item = client.post(
        "/api/v1/food-items",
        json={
            "restaurant_id": restaurant_id,
            "category_id": category_id,
            "name": "Zanzibar Pilau Test",
            "description": "Rice, beef, and spices",
            "price": "14000",
            "preparation_time_minutes": 18,
            "is_available": True,
            "is_featured": True,
            "is_halal": True,
            "is_vegetarian": False,
            "spice_level": "Mild",
            "sort_order": 1,
        },
        headers=owner_headers,
    )
    assert food_item.status_code == 201, food_item.text
    food_item_id = food_item.json()["id"]

    menu_search = client.get("/api/v1/food-items?q=Pilau")
    assert menu_search.status_code == 200
    assert menu_search.json()[0]["id"] == food_item_id

    address = client.post(
        "/api/v1/addresses",
        json={
            "label": "Home",
            "street_address": "Darajani Market",
            "area": "Stone Town",
            "city": "Zanzibar",
            "island": "Unguja",
            "latitude": -6.161,
            "longitude": 39.191,
            "delivery_notes": "Call on arrival",
            "is_default": True,
        },
        headers=customer_headers,
    )
    assert address.status_code == 201, address.text
    address_id = address.json()["id"]

    order = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": restaurant_id,
            "delivery_address_id": address_id,
            "payment_method": "M-Pesa",
            "delivery_type": "standard",
            "service_type": "food",
            "customer_notes": "No extra chili",
            "items": [{"food_item_id": food_item_id, "quantity": 2}],
        },
        headers=customer_headers,
    )
    assert order.status_code == 201, order.text
    order_data = order.json()
    order_id = order_data["id"]
    assert order_data["status"] == "pending"
    assert Decimal(order_data["total_amount"]) == Decimal("30500.00")

    customer_cannot_update = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": ACCEPTED},
        headers=customer_headers,
    )
    assert customer_cannot_update.status_code == 403

    customer_orders = client.get("/api/v1/orders", headers=customer_headers)
    assert customer_orders.status_code == 200
    assert customer_orders.json()[0]["id"] == order_id

    updated_order = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": ACCEPTED},
        headers=owner_headers,
    )
    assert updated_order.status_code == 200
    assert updated_order.json()["status"] == ACCEPTED

    rider = client.post(
        "/api/v1/riders",
        json={
            "user_id": rider_user["id"],
            "vehicle_type": "motorbike",
            "vehicle_plate_number": "ZNZ 204 B",
            "service_area": "Stone Town",
            "island": "Unguja",
        },
        headers=admin_headers,
    )
    assert rider.status_code == 201, rider.text
    rider_id = rider.json()["id"]

    rider_update = client.patch(
        f"/api/v1/riders/{rider_id}",
        json={"is_online": True, "is_available": True, "current_latitude": -6.16, "current_longitude": 39.19},
        headers=rider_headers,
    )
    assert rider_update.status_code == 200
    assert rider_update.json()["is_online"] is True

    assigned_order = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": PREPARING, "rider_id": rider_id},
        headers=admin_headers,
    )
    assert assigned_order.status_code == 200
    assert assigned_order.json()["rider_id"] == rider_id

    hide_item = client.patch(
        f"/api/v1/food-items/{food_item_id}",
        json={"is_available": False},
        headers=owner_headers,
    )
    assert hide_item.status_code == 200
    public_hidden_search = client.get(f"/api/v1/food-items?restaurant_id={restaurant_id}")
    assert public_hidden_search.status_code == 200
    assert all(item["id"] != food_item_id for item in public_hidden_search.json())
    owner_management_search = client.get(
        f"/api/v1/food-items?restaurant_id={restaurant_id}&include_unavailable=true",
        headers=owner_headers,
    )
    assert owner_management_search.status_code == 200
    assert any(item["id"] == food_item_id for item in owner_management_search.json())

    tracking = client.post(
        "/api/v1/delivery-tracking",
        json={
            "order_id": order_id,
            "rider_id": rider_id,
            "status": "picked_up",
            "latitude": -6.16,
            "longitude": 39.19,
            "eta_minutes": 14,
            "distance_km": 4.2,
            "message": "Rider picked up the order",
        },
        headers=rider_headers,
    )
    assert tracking.status_code == 201, tracking.text

    tracking_list = client.get(f"/api/v1/delivery-tracking/order/{order_id}")
    assert tracking_list.status_code == 200
    assert tracking_list.json()[0]["order_id"] == order_id

    provider_status = client.get("/api/v1/payments/providers")
    assert provider_status.status_code == 200
    assert provider_status.json()["mode"] == "mock"
    assert provider_status.json()["providers"]["mpesa"]["configured"] is True

    payment = client.post(
        "/api/v1/payments",
        json={"order_id": order_id, "method": "M-Pesa", "provider": "M-Pesa", "phone_number": "+255700000201"},
        headers=customer_headers,
    )
    assert payment.status_code == 201, payment.text
    payment_id = payment.json()["id"]
    provider_reference = payment.json()["provider_reference"]
    assert payment.json()["provider"] == "mpesa"
    assert payment.json()["status"] == "processing"
    assert payment.json()["requires_customer_action"] is True

    callback = client.post(
        "/api/v1/payments/callbacks/mobile-money",
        json={
            "provider_reference": provider_reference,
            "status": "paid",
            "amount": "30500.00",
            "phone_number": "+255700000201",
            "provider_message": "Payment completed",
            "callback_secret": "change-this-payment-callback-secret",
        },
    )
    assert callback.status_code == 200, callback.text
    assert callback.json()["status"] == PAID

    duplicate_callback = client.post(
        "/api/v1/payments/callbacks/mobile-money",
        json={
            "provider_reference": provider_reference,
            "status": "paid",
            "amount": "30500.00",
            "phone_number": "+255700000201",
            "provider_message": "Duplicate provider callback",
            "callback_secret": "change-this-payment-callback-secret",
        },
    )
    assert duplicate_callback.status_code == 200, duplicate_callback.text
    assert duplicate_callback.json()["status"] == PAID

    wrong_phone_callback = client.post(
        "/api/v1/payments/callbacks/mobile-money",
        json={
            "provider_reference": provider_reference,
            "status": "paid",
            "amount": "30500.00",
            "phone_number": "+255700999999",
            "provider_message": "Wrong phone number",
            "callback_secret": "change-this-payment-callback-secret",
        },
    )
    assert wrong_phone_callback.status_code == 400

    payment_update = client.patch(
        f"/api/v1/payments/{payment_id}",
        json={"status": PAID, "provider_reference": "MPESA-TEST-001"},
        headers=admin_headers,
    )
    assert payment_update.status_code == 200
    assert payment_update.json()["status"] == PAID

    review = client.post(
        "/api/v1/reviews",
        json={
            "order_id": order_id,
            "restaurant_id": restaurant_id,
            "rider_id": rider_id,
            "food_rating": 5,
            "delivery_rating": 5,
            "restaurant_rating": 5,
            "rider_rating": 5,
            "overall_rating": 5,
            "comment": "Excellent",
        },
        headers=customer_headers,
    )
    assert review.status_code == 201, review.text

    restaurant_reviews = client.get(f"/api/v1/reviews/restaurant/{restaurant_id}")
    assert restaurant_reviews.status_code == 200
    assert restaurant_reviews.json()[0]["overall_rating"] == 5

    favorite_restaurant = client.post(
        "/api/v1/favorites",
        json={"restaurant_id": restaurant_id},
        headers=customer_headers,
    )
    assert favorite_restaurant.status_code == 201, favorite_restaurant.text

    favorite_food = client.post(
        "/api/v1/favorites",
        json={"food_item_id": food_item_id},
        headers=customer_headers,
    )
    assert favorite_food.status_code == 201, favorite_food.text

    invalid_favorite = client.post(
        "/api/v1/favorites",
        json={"restaurant_id": restaurant_id, "food_item_id": food_item_id},
        headers=customer_headers,
    )
    assert invalid_favorite.status_code == 400

    favorites = client.get("/api/v1/favorites", headers=customer_headers)
    assert favorites.status_code == 200
    assert len(favorites.json()) == 2

    notification = client.post(
        "/api/v1/notifications",
        json={
            "user_id": customer["id"],
            "title": "Order accepted",
            "message": "Your order has been accepted",
            "notification_type": "order_update",
            "channel": "push",
        },
        headers=admin_headers,
    )
    assert notification.status_code == 201, notification.text
    notification_id = notification.json()["id"]

    my_notifications = client.get("/api/v1/notifications/me", headers=customer_headers)
    assert my_notifications.status_code == 200
    assert my_notifications.json()[0]["id"] == notification_id

    mark_read = client.patch(f"/api/v1/notifications/{notification_id}/read", headers=customer_headers)
    assert mark_read.status_code == 200

    maps = client.post(
        "/api/v1/maps/distance",
        json={
            "origin_latitude": -6.162,
            "origin_longitude": 39.192,
            "destination_latitude": -6.161,
            "destination_longitude": 39.191,
            "preparation_minutes": 10,
        },
    )
    assert maps.status_code == 200
    assert maps.json()["distance_km"] >= 0
    assert maps.json()["eta_minutes"] >= 1

    route = client.post(
        "/api/v1/maps/route-optimization",
        json={
            "stops": [
                {"label": "Restaurant", "latitude": -6.162, "longitude": 39.192},
                {"label": "Customer", "latitude": -6.161, "longitude": 39.191},
            ]
        },
    )
    assert route.status_code == 200
    assert route.json()["total_distance_km"] >= 0

    coupon = client.post(
        "/api/v1/coupons",
        json={
            "code": "WELCOME10",
            "title": "Welcome 10",
            "discount_type": "percent",
            "discount_value": "10",
            "minimum_order_amount": "10000",
            "valid_from": "2026-06-01T00:00:00",
            "valid_until": "2026-12-31T23:59:59",
            "first_order_only": True,
        },
        headers=admin_headers,
    )
    assert coupon.status_code == 201, coupon.text

    coupons = client.get("/api/v1/coupons")
    assert coupons.status_code == 200
    assert coupons.json()[0]["code"] == "WELCOME10"

    language = client.post(
        "/api/v1/content/languages",
        json={"code": "sw", "name": "Swahili", "native_name": "Kiswahili", "is_rtl": False},
        headers=admin_headers,
    )
    assert language.status_code == 201, language.text

    banner = client.post(
        "/api/v1/content/banners",
        json={"title": "Lunch deals", "image_url": "/static/uploads/banner.jpg", "placement": "home"},
        headers=admin_headers,
    )
    assert banner.status_code == 201, banner.text

    promotion = client.post(
        "/api/v1/content/promotions",
        json={
            "restaurant_id": restaurant_id,
            "title": "Pilau deal",
            "promotion_type": "discount",
            "discount_value": "10",
            "starts_at": "2026-06-01T00:00:00",
            "ends_at": "2026-12-31T23:59:59",
        },
        headers=admin_headers,
    )
    assert promotion.status_code == 201, promotion.text


def test_file_upload_endpoints(client):
    register_user(client, CUSTOMER, "+255700000301", "customer301@example.com")
    register_user(client, RESTAURANT, "+255700000302", "owner302@example.com")
    register_user(client, ADMIN, "+255700000303", "admin303@example.com")

    customer_headers, _ = login_user(client, "+255700000301")
    owner_headers, _ = login_user(client, "+255700000302")
    admin_headers, _ = login_user(client, "+255700000303")

    category_id = client.post(
        "/api/v1/categories",
        json={"name": "Snacks"},
        headers=admin_headers,
    ).json()["id"]

    restaurant_id = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Upload Test Cafe",
            "service_type": "restaurant",
            "phone_number": "+255777333444",
            "address": "Kijangwani",
            "area": "Kijangwani",
            "city": "Zanzibar",
            "island": "Unguja",
            "min_order_amount": "5000",
            "delivery_fee": "1500",
            "commission_rate": "15",
        },
        headers=owner_headers,
    ).json()["id"]

    food_item_id = client.post(
        "/api/v1/food-items",
        json={
            "restaurant_id": restaurant_id,
            "category_id": category_id,
            "name": "Chapati Wrap",
            "price": "9000",
        },
        headers=owner_headers,
    ).json()["id"]

    image_upload = client.post(
        f"/api/v1/food-items/{food_item_id}/image",
        files={"image": ("food.png", b"fake-image", "image/png")},
        headers=owner_headers,
    )
    assert image_upload.status_code == 200, image_upload.text
    assert image_upload.json()["image_url"].endswith(".png")

    address_id = client.post(
        "/api/v1/addresses",
        json={"street_address": "Test Street", "area": "Stone Town"},
        headers=customer_headers,
    ).json()["id"]

    order_id = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": restaurant_id,
            "delivery_address_id": address_id,
            "payment_method": "Cash",
            "items": [{"food_item_id": food_item_id, "quantity": 1}],
        },
        headers=customer_headers,
    ).json()["id"]

    cash_payment = client.post(
        "/api/v1/payments",
        json={"order_id": order_id, "method": "Cash"},
        headers=customer_headers,
    )
    assert cash_payment.status_code == 201, cash_payment.text
    assert cash_payment.json()["status"] == COD_PENDING
    assert cash_payment.json()["requires_customer_action"] is False

    review_id = client.post(
        "/api/v1/reviews",
        json={
            "order_id": order_id,
            "restaurant_id": restaurant_id,
            "food_rating": 4,
            "overall_rating": 4,
            "comment": "Good",
        },
        headers=customer_headers,
    ).json()["id"]

    review_upload = client.post(
        f"/api/v1/reviews/{review_id}/image",
        files={"image": ("review.webp", b"fake-image", "image/webp")},
        headers=customer_headers,
    )
    assert review_upload.status_code == 200, review_upload.text
    assert review_upload.json()["image_url"].endswith(".webp")
