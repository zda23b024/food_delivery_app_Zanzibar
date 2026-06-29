import type { MenuItem, Promotion, RestaurantOrder } from "@/types";

export const orders: RestaurantOrder[] = [
  {
    id: "order-1",
    orderNumber: "ZM-9041AA",
    customerName: "Amina Ali",
    status: "preparing",
    total: 30500,
    placedAt: "12:35",
    deliveryType: "hotel",
    items: [
      { name: "Zanzibar Beef Pilau", quantity: 2 },
      { name: "Fresh Mango Juice", quantity: 1 }
    ]
  },
  {
    id: "order-2",
    orderNumber: "ZM-2218PX",
    customerName: "Juma Said",
    status: "pending",
    total: 18000,
    placedAt: "12:42",
    deliveryType: "standard",
    items: [{ name: "Chicken Chapati Wrap", quantity: 2 }]
  },
  {
    id: "order-3",
    orderNumber: "ZM-7720NY",
    customerName: "Nadia",
    status: "ready_for_pickup",
    total: 42000,
    placedAt: "13:04",
    deliveryType: "beach",
    items: [{ name: "Beach Seafood Platter", quantity: 1 }]
  }
];

export const menuItems: MenuItem[] = [
  {
    id: "pilau",
    name: "Zanzibar Beef Pilau",
    category: "Local Meals",
    price: 14000,
    available: true,
    featured: true,
    prepMinutes: 18,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "octopus",
    name: "Octopus Coconut Curry",
    category: "Seafood",
    price: 18000,
    available: true,
    featured: true,
    prepMinutes: 22,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "juice",
    name: "Fresh Mango Juice",
    category: "Drinks",
    price: 4500,
    available: true,
    featured: false,
    prepMinutes: 5,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80"
  }
];

export const promotions: Promotion[] = [
  {
    id: "promo-1",
    title: "Lunch Pilau Deal",
    type: "discount",
    discount: "10%",
    status: "active",
    period: "Jun 1 - Jun 30"
  },
  {
    id: "promo-2",
    title: "Hotel Delivery Boost",
    type: "sponsored",
    discount: "Featured",
    status: "scheduled",
    period: "Jul 1 - Jul 15"
  }
];
