"""initial schema

Revision ID: 20260627_0001
Revises: 
Create Date: 2026-06-27
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260627_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone_number", sa.String(length=32), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("preferred_language", sa.String(length=10), nullable=False),
        sa.Column("profile_image_url", sa.String(length=500), nullable=True),
        sa.Column("is_phone_verified", sa.Boolean(), nullable=False),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_phone_number", "users", ["phone_number"], unique=True)
    op.create_index("ix_users_role", "users", ["role"])
    op.create_index("ix_users_role_active", "users", ["role", "is_active"])

    op.create_table(
        "categories",
        sa.Column("parent_id", sa.String(length=36), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["categories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_categories_name", "categories", ["name"])
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    op.create_table(
        "languages",
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("native_name", sa.String(length=80), nullable=False),
        sa.Column("is_rtl", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_languages_code", "languages", ["code"], unique=True)

    op.create_table(
        "coupons",
        sa.Column("code", sa.String(length=60), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("discount_type", sa.String(length=30), nullable=False),
        sa.Column("discount_value", sa.Numeric(10, 2), nullable=False),
        sa.Column("minimum_order_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("maximum_discount_amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("usage_limit", sa.Integer(), nullable=True),
        sa.Column("used_count", sa.Integer(), nullable=False),
        sa.Column("valid_from", sa.DateTime(), nullable=False),
        sa.Column("valid_until", sa.DateTime(), nullable=False),
        sa.Column("first_order_only", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_coupons_code", "coupons", ["code"], unique=True)

    op.create_table(
        "advertisement_banners",
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("target_url", sa.String(length=500), nullable=True),
        sa.Column("placement", sa.String(length=80), nullable=False),
        sa.Column("starts_at", sa.DateTime(), nullable=True),
        sa.Column("ends_at", sa.DateTime(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_advertisement_banners_placement", "advertisement_banners", ["placement"])

    op.create_table(
        "addresses",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("label", sa.String(length=50), nullable=False),
        sa.Column("contact_name", sa.String(length=120), nullable=True),
        sa.Column("contact_phone", sa.String(length=32), nullable=True),
        sa.Column("street_address", sa.Text(), nullable=False),
        sa.Column("area", sa.String(length=120), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("island", sa.String(length=40), nullable=False),
        sa.Column("landmark", sa.String(length=255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("delivery_notes", sa.Text(), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_addresses_area", "addresses", ["area"])
    op.create_index("ix_addresses_island", "addresses", ["island"])
    op.create_index("ix_addresses_user_id", "addresses", ["user_id"])

    op.create_table(
        "restaurants",
        sa.Column("owner_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("service_type", sa.String(length=40), nullable=False),
        sa.Column("phone_number", sa.String(length=32), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("cover_image_url", sa.String(length=500), nullable=True),
        sa.Column("cuisine_type", sa.String(length=120), nullable=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("area", sa.String(length=120), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("island", sa.String(length=40), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("opening_time", sa.Time(), nullable=True),
        sa.Column("closing_time", sa.Time(), nullable=True),
        sa.Column("min_order_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("delivery_fee", sa.Numeric(10, 2), nullable=False),
        sa.Column("commission_rate", sa.Numeric(5, 2), nullable=False),
        sa.Column("average_rating", sa.Float(), nullable=False),
        sa.Column("rating_count", sa.Integer(), nullable=False),
        sa.Column("is_open", sa.Boolean(), nullable=False),
        sa.Column("accepts_cash", sa.Boolean(), nullable=False),
        sa.Column("accepts_mobile_money", sa.Boolean(), nullable=False),
        sa.Column("supports_tourist_delivery", sa.Boolean(), nullable=False),
        sa.Column("supports_hotel_delivery", sa.Boolean(), nullable=False),
        sa.Column("supports_beach_delivery", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_restaurants_area", "restaurants", ["area"])
    op.create_index("ix_restaurants_cuisine_type", "restaurants", ["cuisine_type"])
    op.create_index("ix_restaurants_island", "restaurants", ["island"])
    op.create_index("ix_restaurants_name", "restaurants", ["name"])
    op.create_index("ix_restaurants_owner_id", "restaurants", ["owner_id"])
    op.create_index("ix_restaurants_service_type", "restaurants", ["service_type"])
    op.create_index("ix_restaurants_slug", "restaurants", ["slug"], unique=True)

    op.create_table(
        "riders",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("vehicle_type", sa.String(length=40), nullable=False),
        sa.Column("vehicle_plate_number", sa.String(length=40), nullable=True),
        sa.Column("license_number", sa.String(length=80), nullable=True),
        sa.Column("national_id_number", sa.String(length=80), nullable=True),
        sa.Column("service_area", sa.String(length=120), nullable=True),
        sa.Column("island", sa.String(length=40), nullable=False),
        sa.Column("current_latitude", sa.Float(), nullable=True),
        sa.Column("current_longitude", sa.Float(), nullable=True),
        sa.Column("is_online", sa.Boolean(), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False),
        sa.Column("average_rating", sa.Float(), nullable=False),
        sa.Column("rating_count", sa.Integer(), nullable=False),
        sa.Column("total_deliveries", sa.Integer(), nullable=False),
        sa.Column("total_earnings", sa.Numeric(12, 2), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_riders_island", "riders", ["island"])
    op.create_index("ix_riders_service_area", "riders", ["service_area"])
    op.create_index("ix_riders_user_id", "riders", ["user_id"], unique=True)
    op.create_index("ix_riders_vehicle_plate_number", "riders", ["vehicle_plate_number"])

    op.create_table(
        "refresh_tokens",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("token_id", sa.String(length=80), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("is_revoked", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_refresh_tokens_token_id", "refresh_tokens", ["token_id"], unique=True)
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])

    op.create_table(
        "notifications",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.String(length=50), nullable=False),
        sa.Column("channel", sa.String(length=40), nullable=False),
        sa.Column("data_json", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_notification_type", "notifications", ["notification_type"])
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    op.create_table(
        "food_items",
        sa.Column("restaurant_id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("discount_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("preparation_time_minutes", sa.Integer(), nullable=False),
        sa.Column("calories", sa.Integer(), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False),
        sa.Column("is_featured", sa.Boolean(), nullable=False),
        sa.Column("is_halal", sa.Boolean(), nullable=False),
        sa.Column("is_vegetarian", sa.Boolean(), nullable=False),
        sa.Column("spice_level", sa.String(length=20), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_food_items_category_id", "food_items", ["category_id"])
    op.create_index("ix_food_items_name", "food_items", ["name"])
    op.create_index("ix_food_items_restaurant_id", "food_items", ["restaurant_id"])

    op.create_table(
        "promotions",
        sa.Column("restaurant_id", sa.String(length=36), nullable=True),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("promotion_type", sa.String(length=40), nullable=False),
        sa.Column("discount_value", sa.Numeric(10, 2), nullable=True),
        sa.Column("starts_at", sa.DateTime(), nullable=False),
        sa.Column("ends_at", sa.DateTime(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_promotions_restaurant_id", "promotions", ["restaurant_id"])

    op.create_table(
        "orders",
        sa.Column("order_number", sa.String(length=40), nullable=False),
        sa.Column("customer_id", sa.String(length=36), nullable=False),
        sa.Column("restaurant_id", sa.String(length=36), nullable=False),
        sa.Column("rider_id", sa.String(length=36), nullable=True),
        sa.Column("delivery_address_id", sa.String(length=36), nullable=True),
        sa.Column("coupon_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("delivery_type", sa.String(length=40), nullable=False),
        sa.Column("service_type", sa.String(length=40), nullable=False),
        sa.Column("payment_method", sa.String(length=40), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("delivery_fee", sa.Numeric(10, 2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("tax_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("customer_notes", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("estimated_delivery_at", sa.DateTime(), nullable=True),
        sa.Column("accepted_at", sa.DateTime(), nullable=True),
        sa.Column("prepared_at", sa.DateTime(), nullable=True),
        sa.Column("picked_up_at", sa.DateTime(), nullable=True),
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["coupon_id"], ["coupons.id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["delivery_address_id"], ["addresses.id"]),
        sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"]),
        sa.ForeignKeyConstraint(["rider_id"], ["riders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_coupon_id", "orders", ["coupon_id"])
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"])
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_restaurant_id", "orders", ["restaurant_id"])
    op.create_index("ix_orders_rider_id", "orders", ["rider_id"])
    op.create_index("ix_orders_service_type", "orders", ["service_type"])
    op.create_index("ix_orders_status", "orders", ["status"])

    op.create_table(
        "favorites",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("restaurant_id", sa.String(length=36), nullable=True),
        sa.Column("food_item_id", sa.String(length=36), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["food_item_id"], ["food_items.id"]),
        sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "restaurant_id", "food_item_id", name="uq_user_favorite_target"),
    )
    op.create_index("ix_favorites_food_item_id", "favorites", ["food_item_id"])
    op.create_index("ix_favorites_restaurant_id", "favorites", ["restaurant_id"])
    op.create_index("ix_favorites_user_id", "favorites", ["user_id"])

    op.create_table(
        "order_items",
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("food_item_id", sa.String(length=36), nullable=False),
        sa.Column("item_name", sa.String(length=160), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("special_instructions", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["food_item_id"], ["food_items.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_items_food_item_id", "order_items", ["food_item_id"])
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])

    op.create_table(
        "payments",
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("method", sa.String(length=40), nullable=False),
        sa.Column("provider", sa.String(length=80), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("provider_reference", sa.String(length=160), nullable=True),
        sa.Column("phone_number", sa.String(length=32), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("paid_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payments_method", "payments", ["method"])
    op.create_index("ix_payments_order_id", "payments", ["order_id"], unique=True)
    op.create_index("ix_payments_provider_reference", "payments", ["provider_reference"], unique=True)
    op.create_index("ix_payments_status", "payments", ["status"])
    op.create_index("ix_payments_user_id", "payments", ["user_id"])

    op.create_table(
        "delivery_tracking",
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("rider_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("eta_minutes", sa.Float(), nullable=True),
        sa.Column("distance_km", sa.Float(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rider_id"], ["riders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_delivery_tracking_order_id", "delivery_tracking", ["order_id"])
    op.create_index("ix_delivery_tracking_rider_id", "delivery_tracking", ["rider_id"])
    op.create_index("ix_delivery_tracking_status", "delivery_tracking", ["status"])

    op.create_table(
        "reviews",
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("customer_id", sa.String(length=36), nullable=False),
        sa.Column("restaurant_id", sa.String(length=36), nullable=False),
        sa.Column("rider_id", sa.String(length=36), nullable=True),
        sa.Column("food_rating", sa.Integer(), nullable=False),
        sa.Column("delivery_rating", sa.Integer(), nullable=True),
        sa.Column("restaurant_rating", sa.Integer(), nullable=True),
        sa.Column("rider_rating", sa.Integer(), nullable=True),
        sa.Column("overall_rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"]),
        sa.ForeignKeyConstraint(["rider_id"], ["riders.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("order_id", "customer_id", name="uq_review_order_customer"),
    )
    op.create_index("ix_reviews_customer_id", "reviews", ["customer_id"])
    op.create_index("ix_reviews_order_id", "reviews", ["order_id"])
    op.create_index("ix_reviews_overall_rating", "reviews", ["overall_rating"])
    op.create_index("ix_reviews_restaurant_id", "reviews", ["restaurant_id"])
    op.create_index("ix_reviews_rider_id", "reviews", ["rider_id"])

    op.create_table(
        "loyalty_points",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("order_id", sa.String(length=36), nullable=True),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("transaction_type", sa.String(length=40), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_loyalty_points_order_id", "loyalty_points", ["order_id"])
    op.create_index("ix_loyalty_points_user_id", "loyalty_points", ["user_id"])

    op.create_table(
        "transactions",
        sa.Column("payment_id", sa.String(length=36), nullable=False),
        sa.Column("transaction_type", sa.String(length=40), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("provider_reference", sa.String(length=160), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["payment_id"], ["payments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_transactions_payment_id", "transactions", ["payment_id"])
    op.create_index("ix_transactions_provider_reference", "transactions", ["provider_reference"])
    op.create_index("ix_transactions_status", "transactions", ["status"])
    op.create_index("ix_transactions_transaction_type", "transactions", ["transaction_type"])

    op.create_table(
        "restaurant_analytics",
        sa.Column("restaurant_id", sa.String(length=36), nullable=False),
        sa.Column("report_date", sa.Date(), nullable=False),
        sa.Column("orders_count", sa.Integer(), nullable=False),
        sa.Column("cancelled_orders_count", sa.Integer(), nullable=False),
        sa.Column("gross_revenue", sa.Numeric(12, 2), nullable=False),
        sa.Column("commission_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("average_preparation_minutes", sa.Integer(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("restaurant_id", "report_date", name="uq_restaurant_daily_analytics"),
    )
    op.create_index("ix_restaurant_analytics_report_date", "restaurant_analytics", ["report_date"])
    op.create_index("ix_restaurant_analytics_restaurant_id", "restaurant_analytics", ["restaurant_id"])


def downgrade() -> None:
    op.drop_table("restaurant_analytics")
    op.drop_table("transactions")
    op.drop_table("loyalty_points")
    op.drop_table("reviews")
    op.drop_table("delivery_tracking")
    op.drop_table("payments")
    op.drop_table("order_items")
    op.drop_table("favorites")
    op.drop_table("orders")
    op.drop_table("promotions")
    op.drop_table("food_items")
    op.drop_table("notifications")
    op.drop_table("refresh_tokens")
    op.drop_table("riders")
    op.drop_table("restaurants")
    op.drop_table("addresses")
    op.drop_table("advertisement_banners")
    op.drop_table("coupons")
    op.drop_table("languages")
    op.drop_table("categories")
    op.drop_table("users")
