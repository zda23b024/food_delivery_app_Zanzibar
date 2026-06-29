const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export const restaurantApi = {
  login: (body: { phone_number: string; password: string }) =>
    request<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  me: (token: string) => request("/auth/me", {}, token),
  getRestaurants: () => request("/restaurants"),
  getFoodItems: (restaurantId?: string) =>
    request(`/food-items${restaurantId ? `?restaurant_id=${restaurantId}` : ""}`),
  getOrders: (token: string) => request("/orders", {}, token),
  updateOrderStatus: (orderId: string, status: string, token: string) =>
    request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }, token),
  createFoodItem: (body: unknown, token: string) =>
    request("/food-items", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),
  updateFoodItem: (foodItemId: string, body: unknown, token: string) =>
    request(`/food-items/${foodItemId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),
  deleteFoodItem: (foodItemId: string, token: string) =>
    request(`/food-items/${foodItemId}`, {
      method: "DELETE"
    }, token),
  createPromotion: (body: unknown, token: string) =>
    request("/content/promotions", {
      method: "POST",
      body: JSON.stringify(body)
    }, token)
};
