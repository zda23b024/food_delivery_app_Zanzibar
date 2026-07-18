"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "@/components/OrderTable";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import type { RestaurantOrder } from "@/types";
import { mapOrder } from "@/utils/backend";

export default function OrdersPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [message, setMessage] = useState("Login as a restaurant owner to load live backend orders.");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    setMessage("Loading live orders...");
    restaurantApi
      .getOrders(accessToken)
      .then((liveOrders) => {
        if (!active) return;
        const mapped = (liveOrders as any[]).map(mapOrder);
        setOrders(mapped);
        setMessage(mapped.length ? "" : "No backend orders yet.");
      })
      .catch((error: Error) => setMessage(error.message));
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function advanceOrder(orderId: string, status: string) {
    if (accessToken) {
      try {
        await restaurantApi.updateOrderStatus(orderId, status, accessToken);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not update order status.");
        return;
      }
    }
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: status as typeof order.status } : order))
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p>Accept new requests, move food into preparation, and hand off to riders.</p>
        </div>
      </div>
      {message && <p className="muted">{message}</p>}
      <OrderTable orders={orders} onAdvance={advanceOrder} />
    </div>
  );
}
