import type { FoodItem, Order, Restaurant } from "@/types";

export const restaurants: Restaurant[] = [
  {
    id: "stone-grill",
    name: "Stone Grill Zanzibar",
    cuisine: "Swahili BBQ",
    area: "Stone Town",
    island: "Unguja",
    rating: 4.8,
    deliveryMinutes: "25-35",
    deliveryFee: 2500,
    minimumOrder: 12000,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    tags: ["Local", "Seafood", "Fast"],
    supportsHotel: true,
    supportsBeach: false,
    isFavorite: true
  },
  {
    id: "dhow-bites",
    name: "Dhow Bites",
    cuisine: "Coastal Fusion",
    area: "Nungwi",
    island: "Unguja",
    rating: 4.7,
    deliveryMinutes: "30-45",
    deliveryFee: 3500,
    minimumOrder: 15000,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    tags: ["Tourist", "Beach", "Dinner"],
    supportsHotel: true,
    supportsBeach: true
  },
  {
    id: "pemba-fresh",
    name: "Pemba Fresh Kitchen",
    cuisine: "Rice, Fish, Juice",
    area: "Chake Chake",
    island: "Pemba",
    rating: 4.6,
    deliveryMinutes: "35-50",
    deliveryFee: 3000,
    minimumOrder: 10000,
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1200&q=80",
    tags: ["Pemba", "Fish", "Family"],
    supportsHotel: false,
    supportsBeach: false
  },
  {
    id: "spice-street",
    name: "Spice Street Cafe",
    cuisine: "Cafe and Snacks",
    area: "Kijangwani",
    island: "Unguja",
    rating: 4.5,
    deliveryMinutes: "20-30",
    deliveryFee: 1800,
    minimumOrder: 8000,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
    tags: ["Coffee", "Snacks", "Students"],
    supportsHotel: true,
    supportsBeach: false
  }
];

export const foodItems: FoodItem[] = [
  {
    id: "octopus-curry",
    restaurantId: "stone-grill",
    name: "Octopus Coconut Curry",
    description: "Tender octopus simmered in coconut sauce with island spices.",
    category: "Seafood",
    price: 18000,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 20,
    halal: true,
    spicy: "Medium"
  },
  {
    id: "zanzibar-pilau",
    restaurantId: "stone-grill",
    name: "Zanzibar Beef Pilau",
    description: "Aromatic rice, slow cooked beef, kachumbari, and tamarind sauce.",
    category: "Local Meals",
    price: 14000,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 18,
    halal: true,
    spicy: "Mild"
  },
  {
    id: "beach-platter",
    restaurantId: "dhow-bites",
    name: "Beach Seafood Platter",
    description: "Grilled prawns, calamari, fish skewers, chips, and mango salsa.",
    category: "Platters",
    price: 32000,
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 28,
    halal: true
  },
  {
    id: "chapati-wrap",
    restaurantId: "spice-street",
    name: "Chicken Chapati Wrap",
    description: "Soft chapati, grilled chicken, crunchy salad, and house sauce.",
    category: "Snacks",
    price: 9000,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 12,
    halal: true
  },
  {
    id: "pemba-fish",
    restaurantId: "pemba-fresh",
    name: "Pemba Fried Fish",
    description: "Fresh local fish with coconut rice, greens, and lime.",
    category: "Fish Market",
    price: 16000,
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 22,
    halal: true
  },
  {
    id: "mango-juice",
    restaurantId: "pemba-fresh",
    name: "Fresh Mango Juice",
    description: "Cold pressed mango juice with no added sugar.",
    category: "Drinks",
    price: 4500,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80",
    prepMinutes: 5,
    halal: true,
    vegetarian: true
  }
];

export const orders: Order[] = [
  {
    id: "ZM-9041AA",
    restaurantName: "Stone Grill Zanzibar",
    status: "Preparing",
    total: 34500,
    placedAt: "Today, 12:35",
    eta: "18 min",
    items: ["Octopus Coconut Curry", "Fresh Mango Juice"]
  },
  {
    id: "ZM-7129CD",
    restaurantName: "Dhow Bites",
    status: "Delivered",
    total: 40500,
    placedAt: "Yesterday, 19:10",
    eta: "Completed",
    items: ["Beach Seafood Platter"]
  }
];

export const paymentMethods = ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"] as const;
