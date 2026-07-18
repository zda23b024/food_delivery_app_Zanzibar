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

async function upload<T>(path: string, formData: FormData, token?: string | null): Promise<T> {
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
  getFoodItems: (restaurantId?: string, token?: string | null) =>
    request(`/food-items${restaurantId ? `?restaurant_id=${restaurantId}&include_unavailable=true` : ""}`, {}, token),
  getFoodItem: (foodItemId: string) => request(`/food-items/${foodItemId}`),
  getCategories: () => request("/categories"),
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
  uploadFoodImage: (foodItemId: string, image: File, token: string) => {
    const formData = new FormData();
    formData.append("image", image);
    return upload(`/food-items/${foodItemId}/image`, formData, token);
  },
  updateRestaurant: (restaurantId: string, body: unknown, token: string) =>
    request(`/restaurants/${restaurantId}`, {
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
    }, token),
  getPromotions: () => request("/content/promotions")
};
