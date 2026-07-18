const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type UserResponse = {
  id: string;
  full_name: string;
  email?: string | null;
  phone_number: string;
  preferred_language: string;
  role: string;
  profile_image_url?: string | null;
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type OrderResponse = {
  id: string;
  order_number: string;
  customer_id: string;
  restaurant_id: string;
  rider_id?: string | null;
  status: string;
  delivery_type: string;
  service_type: string;
  payment_method: string;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  customer_notes?: string | null;
  estimated_delivery_at?: string | null;
  created_at: string;
  items: {
    id: string;
    food_item_id: string;
    item_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
  }[];
};

export type PaymentResponse = {
  id: string;
  order_id: string;
  amount: string;
  currency: string;
  method: string;
  provider?: string | null;
  status: string;
  provider_reference?: string | null;
  checkout_reference?: string | null;
  provider_message?: string | null;
  requires_customer_action?: boolean;
};

export type AddressResponse = {
  id: string;
  user_id: string;
  street_address?: string | null;
  area?: string | null;
  city?: string | null;
  island?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  delivery_notes?: string | null;
  is_default: boolean;
  created_at: string;
};

export type DistanceResponse = {
  distance_km: number;
  eta_minutes: number;
  provider?: string;
};

export type ReverseGeocodeResponse = {
  provider: string;
  formatted_address: string;
  area: string;
  city: string;
  island: string;
  distance_to_area_km?: number;
  fallback_reason?: string;
};

export type TrackingEventResponse = {
  order_id: string;
  rider_id?: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  eta_minutes?: number | null;
  distance_km?: number | null;
  message?: string | null;
  recorded_at?: string | null;
  created_at: string;
};

export type FavoriteResponse = {
  id: string;
  user_id: string;
  restaurant_id?: string | null;
  food_item_id?: string | null;
  created_at: string;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep the generic status message when the backend returns no JSON body.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function uploadRequest<T>(path: string, formData: FormData, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep the generic status message when the backend returns no JSON body.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (body: {
    full_name: string;
    email?: string;
    phone_number: string;
    preferred_language: string;
    password: string;
    role: "customer" | "restaurant" | "rider";
  }) =>
    request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  login: (body: { phone_number: string; password: string }) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  refresh: (refreshToken: string) =>
    request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    }),
  logout: (refreshToken: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    }),
  me: (token: string) => request<UserResponse>("/auth/me", {}, token),
  createAddress: (
    body: {
      street_address?: string;
      area?: string;
      city?: string;
      island?: string;
      landmark?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      delivery_notes?: string | null;
      is_default?: boolean;
    },
    token: string
  ) =>
    request<unknown>("/addresses", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),
  uploadVerificationDocument: (formData: FormData, token: string) =>
    uploadRequest("/verification-documents", formData, token),
  getOrders: (token: string) => request<OrderResponse[]>("/orders", {}, token),
  getRestaurants: () => request("/restaurants"),
  getCategories: () => request("/categories"),
  getFoodItems: () => request("/food-items"),
  getAddresses: (token: string) => request<AddressResponse[]>("/addresses/me", {}, token),
  getFavorites: (token: string) => request<FavoriteResponse[]>("/favorites", {}, token),
  saveFavorite: (body: { restaurant_id?: string; food_item_id?: string }, token?: string | null) =>
    request<FavoriteResponse>("/favorites", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),
  removeFavorite: (favoriteId: string, token?: string | null) =>
    request<{ message: string }>(`/favorites/${favoriteId}`, {
      method: "DELETE"
    }, token),
  getDistance: (body: {
    origin_latitude: number;
    origin_longitude: number;
    destination_latitude: number;
    destination_longitude: number;
    preparation_minutes?: number;
  }) =>
    request<DistanceResponse>("/maps/distance", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  reverseGeocode: (latitude: number, longitude: number) =>
    request<ReverseGeocodeResponse>(`/maps/reverse-geocode?latitude=${latitude}&longitude=${longitude}`),
  getTrackingEvents: (orderId: string) => request<TrackingEventResponse[]>(`/delivery-tracking/order/${orderId}`),
  optimizeRoute: (stops: { label: string; latitude: number; longitude: number }[]) =>
    request("/maps/route-optimization", {
      method: "POST",
      body: JSON.stringify({ stops })
    }),
  createReview: (body: unknown) =>
    request("/reviews", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  sendPayment: (body: unknown, token?: string | null) =>
    request<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),
  createOrder: (body: unknown, token?: string | null) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(body)
    }, token)
};

export function createOrderTrackingSocket(orderId: string) {
  const base = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1").replace(/\/$/, "");
  return new WebSocket(`${base}/live-tracking/orders/${orderId}`);
}
