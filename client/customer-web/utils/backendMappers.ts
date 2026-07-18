import type { FoodItem, Restaurant } from "@/types";

const restaurantImages = [
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80"
];

const foodImages = [
  "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80"
];

function pickImage(id: string, images: string[]) {
  const score = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return images[score % images.length];
}

export function mapRestaurant(record: any): Restaurant {
  return {
    id: record.id,
    name: record.name,
    cuisine: record.cuisine_type || record.service_type || "Zanzibar meals",
    area: record.area || "Zanzibar",
    island: record.island || "Unguja",
    rating: Number(record.average_rating || 4.6),
    deliveryMinutes: "25-35",
    deliveryFee: Number(record.delivery_fee || 2500),
    minimumOrder: Number(record.min_order_amount || 0),
    image: record.cover_image_url || record.logo_url || pickImage(record.id, restaurantImages),
    tags: [record.cuisine_type, record.supports_hotel_delivery ? "Hotel" : null, record.supports_beach_delivery ? "Beach" : null]
      .filter(Boolean)
      .slice(0, 3) as string[],
    supportsHotel: Boolean(record.supports_hotel_delivery),
    supportsBeach: Boolean(record.supports_beach_delivery),
    latitude: record.latitude,
    longitude: record.longitude
  };
}

export function mapFoodItem(record: any, restaurants: Restaurant[] = []): FoodItem {
  const restaurant = restaurants.find((entry) => entry.id === record.restaurant_id);
  return {
    id: record.id,
    restaurantId: record.restaurant_id,
    restaurantName: restaurant?.name,
    name: record.name,
    description: record.description || "Freshly prepared Zanmart item",
    category: record.category_id || "Menu",
    price: Number(record.discount_price || record.price || 0),
    image: record.image_url || pickImage(record.id, foodImages),
    prepMinutes: Number(record.preparation_time_minutes || 20),
    halal: Boolean(record.is_halal ?? true),
    vegetarian: Boolean(record.is_vegetarian),
    spicy: record.spice_level || undefined
  };
}
