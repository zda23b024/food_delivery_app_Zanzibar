export type PaymentMethod = "M-Pesa" | "Airtel Money" | "Tigo Pesa" | "HaloPesa" | "Cash";

export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Picked Up"
  | "Delivered"
  | "Cancelled";

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  island: string;
  rating: number;
  deliveryMinutes: string;
  deliveryFee: number;
  minimumOrder: number;
  image: string;
  tags: string[];
  supportsHotel: boolean;
  supportsBeach: boolean;
  isFavorite?: boolean;
};

export type FoodItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  prepMinutes: number;
  halal: boolean;
  vegetarian?: boolean;
  spicy?: "Mild" | "Medium" | "Hot";
};

export type CartItem = FoodItem & {
  quantity: number;
  restaurantName: string;
};

export type Order = {
  id: string;
  restaurantName: string;
  status: OrderStatus;
  total: number;
  placedAt: string;
  eta: string;
  items: string[];
};
