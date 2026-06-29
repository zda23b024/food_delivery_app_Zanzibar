"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "@/components/OrderTable";
import { useAuth } from "@/contexts/AuthContext";
import { orders as mockOrders } from "@/data/mock";
import { restaurantApi } from "@/services/api";
import type { RestaurantOrder } from "@/types";

export default function OrdersPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<RestaurantOrder[]>(mockOrders);
  const [message, setMessage] = useState("Login as a restaurant owner to load live backend orders.");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    setMessage("Loading live orders...");
    restaurantApi
      .getOrders(accessToken)
      .then((liveOrders) => {
        if (!active) return;
        const mapped = (liveOrders as any[]).map((order) => ({
          id: order.id,
          orderNumber: order.order_number || order.id.slice(0, 8),
          customerName: order.customer_id?.slice(0, 8) || "Customer",
          status: order.status,
          total: Number(order.total_amount || 0),
          placedAt: order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
          deliveryType: order.delivery_type || "standard",
          items: (order.items || []).map((item: any) => ({
            name: item.item_name,
            quantity: item.quantity
          }))
        }));
        setOrders(mapped);
        setMessage(mapped.length ? "" : "No backend orders yet.");
      })
      .catch((error: Error) => setMessage(`${error.message}. Showing demo orders until backend data is available.`));
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
