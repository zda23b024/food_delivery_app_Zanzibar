declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_WS_URL?: string;
  };
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

export type Restaurant = {
  id: string;
  name: string;
  area?: string | null;
  island?: string | null;
  average_rating?: string | number | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  delivery_fee?: string | number | null;
};

export type FoodItem = {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  price: string | number;
  preparation_time_minutes?: number | null;
  is_available: boolean;
};

export type CartItem = FoodItem & {
  quantity: number;
  restaurant_name?: string;
};

export type Order = {
  id: string;
  order_number: string;
  restaurant_id: string;
  rider_id?: string | null;
  status: string;
  total_amount: string;
  delivery_fee: string;
  created_at: string;
  items: { food_item_id: string; item_name: string; quantity: number; total_price: string }[];
};

export type Address = {
  id: string;
  street_address?: string | null;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
};

export type Favorite = {
  id: string;
  restaurant_id?: string | null;
  food_item_id?: string | null;
};

export type TrackingEvent = {
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  eta_minutes?: number | null;
  distance_km?: number | null;
  message?: string | null;
  created_at: string;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep generic message.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const customerApi = {
  login(phone_number: string, password: string) {
    return request<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone_number, password })
    });
  },
  register(body: { full_name: string; phone_number: string; password: string; email?: string }) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...body, preferred_language: "en", role: "customer" })
    });
  },
  me(token: string) {
    return request("/auth/me", {}, token);
  },
  restaurants() {
    return request<Restaurant[]>("/restaurants");
  },
  foodItems(restaurantId?: string) {
    return request<FoodItem[]>(`/food-items${restaurantId ? `?restaurant_id=${restaurantId}` : ""}`);
  },
  addresses(token: string) {
    return request<Address[]>("/addresses/me", {}, token);
  },
  createAddress(body: unknown, token: string) {
    return request<Address>("/addresses", {
      method: "POST",
      body: JSON.stringify(body)
    }, token);
  },
  orders(token: string) {
    return request<Order[]>("/orders", {}, token);
  },
  createOrder(body: unknown, token: string) {
    return request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(body)
    }, token);
  },
  pay(body: unknown, token: string) {
    return request<{ status: string; provider_message?: string; checkout_reference?: string }>("/payments", {
      method: "POST",
      body: JSON.stringify(body)
    }, token);
  },
  favorites(token: string) {
    return request<Favorite[]>("/favorites", {}, token);
  },
  saveFavorite(body: { restaurant_id?: string; food_item_id?: string }, token: string) {
    return request<Favorite>("/favorites", {
      method: "POST",
      body: JSON.stringify(body)
    }, token);
  },
  removeFavorite(favoriteId: string, token: string) {
    return request<{ message: string }>(`/favorites/${favoriteId}`, { method: "DELETE" }, token);
  },
  tracking(orderId: string) {
    return request<TrackingEvent[]>(`/delivery-tracking/order/${orderId}`);
  },
  distance(body: unknown) {
    return request<{ distance_km: number; eta_minutes: number }>("/maps/distance", {
      method: "POST",
      body: JSON.stringify(body)
    });
  }
};

export function createTrackingSocket(orderId: string) {
  const base = WS_BASE_URL.replace(/\/$/, "");
  return new WebSocket(`${base}/live-tracking/orders/${orderId}`);
}

export function formatMoney(value: number) {
  return `TZS ${value.toLocaleString("en-TZ")}`;
}
