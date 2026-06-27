const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getRestaurants: () => request("/restaurants"),
  getCategories: () => request("/categories"),
  getFoodItems: () => request("/food-items"),
  saveFavorite: (body: { restaurant_id?: string; food_item_id?: string }) =>
    request("/favorites", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  removeFavorite: (favoriteId: string) =>
    request(`/favorites/${favoriteId}`, {
      method: "DELETE"
    }),
  getDistance: (body: {
    origin_latitude: number;
    origin_longitude: number;
    destination_latitude: number;
    destination_longitude: number;
    preparation_minutes?: number;
  }) =>
    request("/maps/distance", {
      method: "POST",
      body: JSON.stringify(body)
    }),
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
  sendPayment: (body: unknown) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  createOrder: (body: unknown) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(body)
    })
};

export function createOrderTrackingSocket(orderId: string) {
  const base = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1").replace(/\/$/, "");
  return new WebSocket(`${base}/live-tracking/orders/${orderId}`);
}
