from app.constants.roles import ADMIN, CUSTOMER, RESTAURANT, RIDER
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.models.rider import Rider
from app.models.user import User
from app.utils.helpers import slugify


def get_or_create_user(db, phone_number: str, role: str, full_name: str, email: str):
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if user:
        return user
    user = User(
        full_name=full_name,
        email=email,
        phone_number=phone_number,
        role=role,
        password_hash=hash_password("Password123"),
        is_phone_verified=True,
    )
    db.add(user)
    db.flush()
    return user


def seed_demo_data():
    db = SessionLocal()
    try:
        admin = get_or_create_user(db, "+255700100001", ADMIN, "ZanMeal Admin", "admin@zanmeal.local")
        owner = get_or_create_user(db, "+255700100002", RESTAURANT, "Demo Restaurant Owner", "owner@zanmeal.local")
        rider_user = get_or_create_user(db, "+255700100003", RIDER, "Demo Rider", "rider@zanmeal.local")
        get_or_create_user(db, "+255700100004", CUSTOMER, "Demo Customer", "customer@zanmeal.local")

        category = db.query(Category).filter(Category.name == "Swahili Meals").first()
        if category is None:
            category = Category(name="Swahili Meals", description="Local Zanzibar favorites", sort_order=1)
            db.add(category)
            db.flush()

        restaurant = db.query(Restaurant).filter(Restaurant.slug == "demo-stone-town-bites").first()
        if restaurant is None:
            restaurant = Restaurant(
                owner_id=owner.id,
                name="Demo Stone Town Bites",
                slug="demo-stone-town-bites",
                description="Pilau, seafood, juices, and quick hotel delivery.",
                service_type="restaurant",
                phone_number="+255777100200",
                email="demo@stonetownbites.local",
                cuisine_type="Swahili",
                address="Mkunazini Street",
                area="Stone Town",
                city="Zanzibar",
                island="Unguja",
                latitude=-6.162,
                longitude=39.192,
                min_order_amount=8000,
                delivery_fee=2500,
                supports_hotel_delivery=True,
                supports_tourist_delivery=True,
            )
            db.add(restaurant)
            db.flush()

        if not db.query(FoodItem).filter(FoodItem.restaurant_id == restaurant.id).first():
            db.add_all(
                [
                    FoodItem(
                        restaurant_id=restaurant.id,
                        category_id=category.id,
                        name="Demo Zanzibar Beef Pilau",
                        description="Aromatic rice with beef and island spices.",
                        price=14000,
                        preparation_time_minutes=18,
                        is_featured=True,
                    ),
                    FoodItem(
                        restaurant_id=restaurant.id,
                        category_id=category.id,
                        name="Demo Mango Juice",
                        description="Fresh local mango juice.",
                        price=4500,
                        preparation_time_minutes=5,
                    ),
                ]
            )

        if not db.query(Rider).filter(Rider.user_id == rider_user.id).first():
            db.add(
                Rider(
                    user_id=rider_user.id,
                    vehicle_type="motorbike",
                    vehicle_plate_number="ZNZ 204 B",
                    service_area="Stone Town",
                    island="Unguja",
                    is_online=True,
                    is_available=True,
                )
            )

        db.commit()
        return {"admin_id": admin.id, "restaurant_id": restaurant.id}
    finally:
        db.close()


if __name__ == "__main__":
    print(seed_demo_data())
