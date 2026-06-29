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
  restaurants: () => request("/restaurants"),
  riders: (token: string) => request("/riders", {}, token),
  orders: (token: string) => request("/orders", {}, token),
  payments: (token: string) => request("/payments", {}, token),
  reviews: (token: string) => request("/reviews", {}, token),
  analytics: (token: string) => request("/analytics/restaurants", {}, token)
};
