export type OrderStatus = "pending" | "accepted" | "preparing" | "ready_for_pickup" | "picked_up" | "delivered" | "cancelled";

export type RestaurantOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  placedAt: string;
  deliveryType: "standard" | "hotel" | "beach";
  items: { name: string; quantity: number }[];
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
  prepMinutes: number;
  image: string;
};

export type Promotion = {
  id: string;
  title: string;
  type: string;
  discount: string;
  status: "active" | "scheduled" | "ended";
  period: string;
};
