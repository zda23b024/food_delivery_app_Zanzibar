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

export const adminApi = {
  login: (body: { phone_number: string; password: string }) =>
    request<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  me: (token: string) => request("/auth/me", {}, token),
  users: (token: string) => request("/users", {}, token),
  updateUser: (userId: string, body: unknown, token: string) =>
    request(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),
  restaurants: () => request("/restaurants"),
  updateRestaurant: (restaurantId: string, body: unknown, token: string) =>
    request(`/restaurants/${restaurantId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),
  riders: (token: string) => request("/riders", {}, token),
  updateRider: (riderId: string, body: unknown, token: string) =>
    request(`/riders/${riderId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),
  orders: (token: string) => request("/orders", {}, token),
  updateOrderStatus: (orderId: string, status: string, token: string) =>
    request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }, token),
  payments: (token: string) => request("/payments", {}, token),
  updatePayment: (paymentId: string, body: unknown, token: string) =>
    request(`/payments/${paymentId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),
  reviews: (token: string) => request("/reviews", {}, token),
  deleteReview: (reviewId: string, token: string) =>
    request(`/reviews/${reviewId}`, {
      method: "DELETE"
    }, token),
  analytics: (token: string) => request("/analytics/restaurants", {}, token)
};
