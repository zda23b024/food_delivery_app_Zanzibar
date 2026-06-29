const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

export type TrackingPayload = {
  order_id: string;
  rider_id?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  eta_minutes?: number;
  distance_km?: number;
  message?: string;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string) {
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

export const riderApi = {
  login(phone_number: string, password: string) {
    return request<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone_number, password })
    });
  },
  me(token: string) {
    return request("/auth/me", {}, token);
  },
  riderProfile(token: string) {
    return request("/riders/me", {}, token);
  },
  availableOrders(token: string) {
    return request("/riders/available-orders", {}, token);
  },
  acceptedOrders(token: string) {
    return request("/riders/me/orders", {}, token);
  },
  earnings(token: string) {
    return request("/riders/me/earnings", {}, token);
  },
  updateRider(riderId: string, body: unknown, token: string) {
    return request(
      `/riders/${riderId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body)
      },
      token
    );
  },
  updateOrderStatus(orderId: string, status: string, token: string, riderId?: string) {
    return request(
      `/orders/${orderId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, rider_id: riderId })
      },
      token
    );
  },
  sendTracking(payload: TrackingPayload, token: string) {
    return request(
      "/delivery-tracking",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      token
    );
  }
};

export function createTrackingSocket(orderId: string) {
  const base = WS_BASE_URL.replace(/\/$/, "");
  return new WebSocket(`${base}/live-tracking/orders/${orderId}`);
}
