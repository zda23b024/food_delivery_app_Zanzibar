from decimal import Decimal

from app.constants.roles import ADMIN, CUSTOMER, RESTAURANT, RIDER
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.models.rider import Rider
from app.models.user import User
from app.utils.helpers import slugify


DEMO_PASSWORD = "Password123"


def get_or_create_user(db, phone_number: str, role: str, full_name: str, email: str):
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if user:
        user.full_name = full_name
        user.email = email
        user.role = role
        user.password_hash = hash_password(DEMO_PASSWORD)
        user.is_active = True
        user.is_phone_verified = True
        return user
    user = User(
        full_name=full_name,
        email=email,
        phone_number=phone_number,
        role=role,
        password_hash=hash_password(DEMO_PASSWORD),
        is_phone_verified=True,
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_category(db, name: str, description: str, sort_order: int, image_url: str | None = None):
    category = db.query(Category).filter(Category.name == name).first()
    if category:
        category.description = description
        category.image_url = image_url or category.image_url
        category.sort_order = sort_order
        return category
    category = Category(name=name, slug=slugify(name), description=description, sort_order=sort_order, image_url=image_url)
    db.add(category)
    db.flush()
    return category


def upsert_restaurant(db, owner_id: str, payload: dict):
    restaurant = db.query(Restaurant).filter(Restaurant.slug == payload["slug"]).first()
    if restaurant:
        for key, value in payload.items():
            setattr(restaurant, key, value)
        restaurant.owner_id = owner_id
        db.flush()
        return restaurant
    restaurant = Restaurant(owner_id=owner_id, **payload)
    db.add(restaurant)
    db.flush()
    return restaurant


def upsert_food(db, restaurant_id: str, category_id: str, payload: dict):
    item = db.query(FoodItem).filter(FoodItem.restaurant_id == restaurant_id, FoodItem.name == payload["name"]).first()
    if item:
        for key, value in payload.items():
            setattr(item, key, value)
        item.category_id = category_id
        db.flush()
        return item
    item = FoodItem(restaurant_id=restaurant_id, category_id=category_id, **payload)
    db.add(item)
    db.flush()
    return item


def seed_demo_data():
    db = SessionLocal()
    try:
        admin = get_or_create_user(db, "+255700100001", ADMIN, "Zanmart Admin", "admin@zanmart.local")
        customer = get_or_create_user(db, "+255700100004", CUSTOMER, "Demo Customer", "customer@zanmart.local")
        rider_user = get_or_create_user(db, "+255700100003", RIDER, "Town Rider", "rider@zanmart.local")

        owner = get_or_create_user(db, "+255700100020", RESTAURANT, "Zanmart Town Restaurant Owner", "town.owner@zanmart.local")

        categories = {
            "Swahili Meals": get_or_create_category(
                db,
                "Swahili Meals",
                "Pilau, biryani, coconut curries, urojo, and local rice dishes.",
                1,
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
            ),
            "Seafood": get_or_create_category(
                db,
                "Seafood",
                "Fish, octopus, prawns, calamari, lobster, and coastal grills.",
                2,
                "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=900&q=80",
            ),
            "Street Food": get_or_create_category(
                db,
                "Street Food",
                "Zanzibar pizza, mishkaki, samosa, chips, cassava, and night-market bites.",
                3,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
            ),
            "Pizza and Burgers": get_or_create_category(
                db,
                "Pizza and Burgers",
                "Pizza, burgers, sandwiches, fries, and fast casual meals.",
                4,
                "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
            ),
            "Cafe and Breakfast": get_or_create_category(
                db,
                "Cafe and Breakfast",
                "Coffee, pancakes, eggs, chapati wraps, cakes, and light meals.",
                5,
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
            ),
            "Drinks": get_or_create_category(
                db,
                "Drinks",
                "Fresh juices, spiced tea, coffee, smoothies, and cold drinks.",
                6,
                "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80",
            ),
        }

        burger_image = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
        pizza_image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80"
        seafood_image = "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80"
        pilau_image = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80"
        coffee_image = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
        chicken_image = "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80"
        noodles_image = "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80"
        juice_image = "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=80"

        # Real public Stone Town / Zanzibar City venues. Contact details are demo-only.
        restaurants = [
            {
                "restaurant": {
                    "name": "Lukmaan Restaurant",
                    "slug": "lukmaan-restaurant-stone-town",
                    "description": "Popular Stone Town local restaurant known by visitors for Zanzibari and Swahili meals. Demo menu curated for Zanmart.",
                    "service_type": "restaurant",
                    "phone_number": "+255777100301",
                    "email": "lukmaan.demo@zanmart.local",
                    "logo_url": pilau_image,
                    "cover_image_url": pilau_image,
                    "cuisine_type": "Swahili Local Meals",
                    "address": "Vuga Road, Stone Town",
                    "area": "Vuga",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1653,
                    "longitude": 39.1918,
                    "min_order_amount": Decimal("7000"),
                    "delivery_fee": Decimal("2000"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.7,
                    "rating_count": 860,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Swahili Meals", {"name": "Zanzibar Beef Pilau", "description": "Spiced rice with beef, cloves, cinnamon, and cardamom.", "image_url": pilau_image, "price": Decimal("12000"), "preparation_time_minutes": 20, "is_featured": True, "spice_level": "medium"}),
                    ("Swahili Meals", {"name": "Chicken Biryani", "description": "Layered rice and chicken with masala, raisins, and fried onions.", "image_url": pilau_image, "price": Decimal("15000"), "preparation_time_minutes": 24, "is_featured": True}),
                    ("Street Food", {"name": "Urojo Zanzibar Mix", "description": "Tangy turmeric soup with potatoes, fritters, egg, chutney, and chili.", "image_url": chicken_image, "price": Decimal("7000"), "preparation_time_minutes": 12}),
                ],
            },
            {
                "restaurant": {
                    "name": "6 Degrees South Grill and Wine Bar",
                    "slug": "6-degrees-south-stone-town",
                    "description": "Known Stone Town waterfront dining spot. Demo listing focuses on seafood grills and burgers for town delivery.",
                    "service_type": "restaurant",
                    "phone_number": "+255777100302",
                    "email": "6degrees.demo@zanmart.local",
                    "logo_url": burger_image,
                    "cover_image_url": burger_image,
                    "cuisine_type": "Grill, Seafood and Burgers",
                    "address": "Shangani waterfront, Stone Town",
                    "area": "Stone Town",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1616,
                    "longitude": 39.1879,
                    "min_order_amount": Decimal("12000"),
                    "delivery_fee": Decimal("2500"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.6,
                    "rating_count": 520,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Pizza and Burgers", {"name": "Beef Burger and Fries", "description": "Grilled beef burger with fries and house sauce.", "image_url": burger_image, "price": Decimal("18000"), "preparation_time_minutes": 22, "is_featured": True}),
                    ("Seafood", {"name": "Grilled Calamari Plate", "description": "Char-grilled calamari with salad and chips.", "image_url": seafood_image, "price": Decimal("24000"), "preparation_time_minutes": 24}),
                    ("Drinks", {"name": "Passion Fruit Cooler", "description": "Cold passion fruit drink with lime.", "image_url": juice_image, "price": Decimal("6000"), "preparation_time_minutes": 5}),
                ],
            },
            {
                "restaurant": {
                    "name": "Cape Town Fish Market Zanzibar",
                    "slug": "cape-town-fish-market-zanzibar",
                    "description": "Seafood-focused Zanzibar City restaurant listing with demo menu for delivery testing.",
                    "service_type": "restaurant",
                    "phone_number": "+255777100303",
                    "email": "ctfm.demo@zanmart.local",
                    "logo_url": seafood_image,
                    "cover_image_url": seafood_image,
                    "cuisine_type": "Seafood",
                    "address": "Mizingani / Forodhani area, Stone Town",
                    "area": "Stone Town",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1595,
                    "longitude": 39.1904,
                    "min_order_amount": Decimal("15000"),
                    "delivery_fee": Decimal("2500"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.5,
                    "rating_count": 390,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Seafood", {"name": "Seafood Platter", "description": "Fish, prawns, calamari, chips, and salad.", "image_url": seafood_image, "price": Decimal("39000"), "preparation_time_minutes": 32, "is_featured": True}),
                    ("Seafood", {"name": "Prawn Coconut Curry", "description": "Prawns cooked in coconut sauce with steamed rice.", "image_url": seafood_image, "price": Decimal("28000"), "preparation_time_minutes": 26}),
                    ("Seafood", {"name": "Grilled Fish Fillet", "description": "Grilled fish fillet with lemon, salad, and fries.", "image_url": seafood_image, "price": Decimal("23000"), "preparation_time_minutes": 22}),
                ],
            },
            {
                "restaurant": {
                    "name": "Emerson on Hurumzi Tea House",
                    "slug": "emerson-hurumzi-tea-house",
                    "description": "Historic Hurumzi hotel restaurant known for atmospheric rooftop dining. Demo menu inspired by Swahili-Arab flavours.",
                    "service_type": "hotel_restaurant",
                    "phone_number": "+255777100304",
                    "email": "emerson.demo@zanmart.local",
                    "logo_url": pilau_image,
                    "cover_image_url": pilau_image,
                    "cuisine_type": "Swahili-Arab Rooftop",
                    "address": "Hurumzi, Stone Town",
                    "area": "Kijangwani",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1613,
                    "longitude": 39.1925,
                    "min_order_amount": Decimal("12000"),
                    "delivery_fee": Decimal("2000"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.8,
                    "rating_count": 440,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Swahili Meals", {"name": "Persian-Spiced Chicken Rice", "description": "Aromatic rice with chicken, nuts, raisins, and warm spices.", "image_url": pilau_image, "price": Decimal("24000"), "preparation_time_minutes": 28, "is_featured": True}),
                    ("Seafood", {"name": "Coconut Fish Curry", "description": "Local fish in coconut curry with rice.", "image_url": seafood_image, "price": Decimal("26000"), "preparation_time_minutes": 26}),
                    ("Drinks", {"name": "Spiced Rooftop Tea", "description": "Tea with cardamom, cinnamon, cloves, and ginger.", "image_url": coffee_image, "price": Decimal("5000"), "preparation_time_minutes": 6}),
                ],
            },
            {
                "restaurant": {
                    "name": "Zanzibar Coffee House Cafe",
                    "slug": "zanzibar-coffee-house-cafe",
                    "description": "Stone Town cafe-style listing for coffee, breakfast, cakes, and light meals.",
                    "service_type": "cafe",
                    "phone_number": "+255777100305",
                    "email": "coffeehouse.demo@zanmart.local",
                    "logo_url": coffee_image,
                    "cover_image_url": coffee_image,
                    "cuisine_type": "Coffee and Breakfast",
                    "address": "Kenyatta Road / Stone Town",
                    "area": "Stone Town",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1628,
                    "longitude": 39.1909,
                    "min_order_amount": Decimal("6000"),
                    "delivery_fee": Decimal("2000"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.6,
                    "rating_count": 310,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Cafe and Breakfast", {"name": "Zanzibar Coffee and Pancakes", "description": "Fresh coffee with pancakes and tropical fruit.", "image_url": coffee_image, "price": Decimal("12000"), "preparation_time_minutes": 15, "is_featured": True}),
                    ("Cafe and Breakfast", {"name": "Egg Chapati Breakfast Wrap", "description": "Egg, tomato, greens, and sauce wrapped in chapati.", "image_url": chicken_image, "price": Decimal("9000"), "preparation_time_minutes": 14}),
                    ("Drinks", {"name": "Iced Zanzibar Coffee", "description": "Cold coffee with milk and spice aroma.", "image_url": coffee_image, "price": Decimal("6500"), "preparation_time_minutes": 6}),
                ],
            },
            {
                "restaurant": {
                    "name": "Mercury's Bar",
                    "slug": "mercurys-bar-stone-town",
                    "description": "Known Stone Town seafront bar and restaurant listing with casual seafood and fast meals.",
                    "service_type": "restaurant",
                    "phone_number": "+255777100306",
                    "email": "mercurys.demo@zanmart.local",
                    "logo_url": pizza_image,
                    "cover_image_url": pizza_image,
                    "cuisine_type": "Pizza, Seafood and Grill",
                    "address": "Mizingani seafront, Stone Town",
                    "area": "Malindi",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1574,
                    "longitude": 39.1917,
                    "min_order_amount": Decimal("10000"),
                    "delivery_fee": Decimal("2000"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.4,
                    "rating_count": 470,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Pizza and Burgers", {"name": "Seafood Pizza", "description": "Pizza topped with prawns, calamari, peppers, and cheese.", "image_url": pizza_image, "price": Decimal("22000"), "preparation_time_minutes": 24, "is_featured": True}),
                    ("Pizza and Burgers", {"name": "Cheese Burger", "description": "Beef patty, cheese, salad, and fries.", "image_url": burger_image, "price": Decimal("17000"), "preparation_time_minutes": 20}),
                    ("Seafood", {"name": "Fish Fingers and Chips", "description": "Crispy fish strips with fries and tartar sauce.", "image_url": seafood_image, "price": Decimal("16000"), "preparation_time_minutes": 18}),
                ],
            },
            {
                "restaurant": {
                    "name": "Maru Maru Terrace Restaurant",
                    "slug": "maru-maru-terrace-restaurant",
                    "description": "Hotel terrace restaurant in central Stone Town. Demo menu includes Indian, Swahili, and seafood favourites.",
                    "service_type": "hotel_restaurant",
                    "phone_number": "+255777100307",
                    "email": "marumaru.demo@zanmart.local",
                    "logo_url": chicken_image,
                    "cover_image_url": chicken_image,
                    "cuisine_type": "Indian and Swahili",
                    "address": "Gizenga / Stone Town",
                    "area": "Stone Town",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1612,
                    "longitude": 39.1907,
                    "min_order_amount": Decimal("9000"),
                    "delivery_fee": Decimal("2000"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.5,
                    "rating_count": 260,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Swahili Meals", {"name": "Butter Chicken and Rice", "description": "Creamy chicken curry with steamed rice.", "image_url": chicken_image, "price": Decimal("19000"), "preparation_time_minutes": 24, "is_featured": True}),
                    ("Seafood", {"name": "Tandoori Fish", "description": "Spiced fish served with salad and rice.", "image_url": seafood_image, "price": Decimal("24000"), "preparation_time_minutes": 26}),
                    ("Pizza and Burgers", {"name": "Vegetable Pizza", "description": "Cheese pizza with peppers, onion, tomato, and herbs.", "image_url": pizza_image, "price": Decimal("16000"), "preparation_time_minutes": 22, "is_vegetarian": True}),
                ],
            },
            {
                "restaurant": {
                    "name": "Tembo House Hotel Restaurant",
                    "slug": "tembo-house-hotel-restaurant",
                    "description": "Stone Town hotel restaurant near the seafront. Demo listing supports hotel delivery and tourist ordering.",
                    "service_type": "hotel_restaurant",
                    "phone_number": "+255777100308",
                    "email": "tembohouse.demo@zanmart.local",
                    "logo_url": noodles_image,
                    "cover_image_url": noodles_image,
                    "cuisine_type": "Hotel Dining",
                    "address": "Shangani / Vuga, Stone Town",
                    "area": "Vuga",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1629,
                    "longitude": 39.1880,
                    "min_order_amount": Decimal("9000"),
                    "delivery_fee": Decimal("2000"),
                    "commission_rate": Decimal("15"),
                    "average_rating": 4.4,
                    "rating_count": 210,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Swahili Meals", {"name": "Chicken Noodles", "description": "Stir-fried noodles with chicken and vegetables.", "image_url": noodles_image, "price": Decimal("13000"), "preparation_time_minutes": 18, "is_featured": True}),
                    ("Seafood", {"name": "Prawn Fried Rice", "description": "Fried rice with prawns, vegetables, and soy sauce.", "image_url": pilau_image, "price": Decimal("17000"), "preparation_time_minutes": 18}),
                    ("Drinks", {"name": "Mango Smoothie", "description": "Cold mango smoothie with milk.", "image_url": juice_image, "price": Decimal("7000"), "preparation_time_minutes": 6}),
                ],
            },
            {
                "restaurant": {
                    "name": "Forodhani Gardens Food Market",
                    "slug": "forodhani-gardens-food-market",
                    "description": "Public Stone Town night food market area known for grilled seafood, Zanzibar pizza, samoosas, cassava, and sweet potatoes.",
                    "service_type": "food_market",
                    "phone_number": "+255777100309",
                    "email": "forodhani.market.demo@zanmart.local",
                    "logo_url": seafood_image,
                    "cover_image_url": seafood_image,
                    "cuisine_type": "Street Food and Seafood",
                    "address": "Forodhani seafront, Stone Town",
                    "area": "Stone Town",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1604,
                    "longitude": 39.1898,
                    "min_order_amount": Decimal("5000"),
                    "delivery_fee": Decimal("1500"),
                    "commission_rate": Decimal("12"),
                    "average_rating": 4.7,
                    "rating_count": 980,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Street Food", {"name": "Zanzibar Pizza", "description": "Stuffed street-food pancake with egg, minced beef, onion, and sauce.", "image_url": pizza_image, "price": Decimal("8000"), "preparation_time_minutes": 14, "is_featured": True}),
                    ("Seafood", {"name": "Mishkaki and Octopus Skewers", "description": "Charcoal grilled skewers with kachumbari and chili.", "image_url": seafood_image, "price": Decimal("12000"), "preparation_time_minutes": 16}),
                    ("Street Food", {"name": "Cassava and Samosa Plate", "description": "Fried cassava, samosa, chutney, and chili.", "image_url": chicken_image, "price": Decimal("6500"), "preparation_time_minutes": 10}),
                ],
            },
            {
                "restaurant": {
                    "name": "Jaws Corner Coffee",
                    "slug": "jaws-corner-coffee-stone-town",
                    "description": "Stone Town coffee corner listing inspired by the well-known local gathering spot for Arabic coffee and snacks.",
                    "service_type": "cafe",
                    "phone_number": "+255777100310",
                    "email": "jawscorner.demo@zanmart.local",
                    "logo_url": coffee_image,
                    "cover_image_url": coffee_image,
                    "cuisine_type": "Coffee and Local Snacks",
                    "address": "Jaws Corner, Stone Town",
                    "area": "Kijangwani",
                    "city": "Zanzibar City",
                    "island": "Unguja",
                    "latitude": -6.1620,
                    "longitude": 39.1917,
                    "min_order_amount": Decimal("3000"),
                    "delivery_fee": Decimal("1500"),
                    "commission_rate": Decimal("12"),
                    "average_rating": 4.6,
                    "rating_count": 340,
                    "supports_hotel_delivery": True,
                    "supports_tourist_delivery": True,
                    "supports_beach_delivery": False,
                },
                "foods": [
                    ("Cafe and Breakfast", {"name": "Arabic Coffee and Dates", "description": "Small strong coffee served with dates.", "image_url": coffee_image, "price": Decimal("5000"), "preparation_time_minutes": 6, "is_featured": True}),
                    ("Street Food", {"name": "Mandazi and Tea", "description": "Soft mandazi with spiced tea.", "image_url": coffee_image, "price": Decimal("4000"), "preparation_time_minutes": 8, "is_vegetarian": True}),
                    ("Drinks", {"name": "Tangawizi Tea", "description": "Ginger tea with cinnamon and cloves.", "image_url": coffee_image, "price": Decimal("3000"), "preparation_time_minutes": 5}),
                ],
            },
        ]

        for entry in restaurants:
            restaurant = upsert_restaurant(db, owner.id, entry["restaurant"])
            for category_name, food_payload in entry["foods"]:
                upsert_food(db, restaurant.id, categories[category_name].id, food_payload)

        if not db.query(Rider).filter(Rider.user_id == rider_user.id).first():
            db.add(
                Rider(
                    user_id=rider_user.id,
                    vehicle_type="motorbike",
                    vehicle_plate_number="ZNZ 204 B",
                    service_area="Stone Town, Malindi, Vuga, Kijangwani, Darajani, Michenzani, Mlandege",
                    island="Unguja",
                    is_online=True,
                    is_available=True,
                    current_latitude=-6.162,
                    current_longitude=39.192,
                )
            )

        db.commit()
        return {
            "admin_id": admin.id,
            "customer_id": customer.id,
            "restaurants": len(restaurants),
            "categories": len(categories),
            "demo_password": DEMO_PASSWORD,
            "coverage": "Unguja town only: Stone Town, Malindi, Vuga, Kijangwani, Darajani, Michenzani, Mlandege",
        }
    finally:
        db.close()


if __name__ == "__main__":
    print(seed_demo_data())
