import type { MenuItem, RestaurantOrder } from "@/types";

export function findOwnedRestaurant(restaurants: any[], userId?: string | null) {
  return restaurants.find((restaurant) => restaurant.owner_id === userId) || null;
}

export function mapOrder(order: any): RestaurantOrder {
  return {
    id: order.id,
    orderNumber: order.order_number || order.id.slice(0, 8),
    customerName: order.customer_id?.slice(0, 8) || "Customer",
    status: order.status,
    total: Number(order.total_amount || 0),
    placedAt: order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
    deliveryType: order.delivery_type || "standard",
    items: (order.items || []).map((item: any) => ({
      name: item.item_name,
      quantity: item.quantity
    }))
  };
}

export function mapMenuItem(item: any): MenuItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category_id || "Menu",
    price: Number(item.price || 0),
    available: Boolean(item.is_available),
    featured: Boolean(item.is_featured),
    prepMinutes: item.preparation_time_minutes || 20,
    image: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
  };
}
