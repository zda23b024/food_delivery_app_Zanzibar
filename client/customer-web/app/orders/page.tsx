"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ReviewComposer } from "@/components/ReviewComposer";
import { TrackingPanel } from "@/components/TrackingPanel";
import { useAuth } from "@/contexts/AuthContext";
import { api, type OrderResponse } from "@/services/api";
import { formatMoney } from "@/utils/money";

const nextStatuses = ["Pending", "Accepted", "Preparing", "Ready", "Picked Up", "Delivered"];

export default function OrdersPage() {
  const { user, accessToken, loading } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [error, setError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    setLoadingOrders(true);
    api
      .getOrders(accessToken)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders"))
      .finally(() => setLoadingOrders(false));
  }, [accessToken]);

  const activeOrder = useMemo(
    () => orders.find((order) => !["delivered", "cancelled"].includes(order.status.toLowerCase())) || orders[0],
    [orders]
  );

  if (loading) {
    return <div className="profile-panel">Loading orders...</div>;
  }

  if (!user) {
    return (
      <div className="auth-page inline">
        <section className="auth-panel">
          <h1>Login Required</h1>
          <p>Login to view orders and receive real-time rider updates.</p>
          <Link href="/login?next=/orders" className="primary-button">Login</Link>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Orders</h2>
          <p>Track active orders and review past deliveries.</p>
        </div>
      </div>

      {loadingOrders && <p className="profile-panel">Loading backend orders...</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="order-list">
        {orders.length === 0 && !loadingOrders ? (
          <section className="empty-state profile-panel">
            <strong>No orders yet</strong>
            <p>Place an order from checkout and it will appear here with live tracking.</p>
            <Link href="/restaurants" className="primary-button">Browse Restaurants</Link>
          </section>
        ) : orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <div className="row">
                {order.status.toLowerCase() === "delivered" ? <CheckCircle2 size={20} color="#22c55e" /> : <Clock size={20} color="#d95700" />}
                <strong>{order.order_number}</strong>
                <span className={`status-pill ${order.status.toLowerCase().replace(" ", "-")}`}>{order.status}</span>
              </div>
              <p>{order.items.map((item) => `${item.quantity}x ${item.item_name}`).join(", ")}</p>
              <small>{new Date(order.created_at).toLocaleString()}</small>
            </div>
            <strong>{formatMoney(Number(order.total_amount))}</strong>
          </article>
        ))}
      </div>

      <div className="section-head">
        <div>
          <h2>Order Status Flow</h2>
          <p>Pending, Accepted, Preparing, Ready, Picked Up, Delivered, Cancelled.</p>
        </div>
      </div>
      <div className="tag-row">
        {nextStatuses.map((status) => <span key={status}>{status}</span>)}
        <span><XCircle size={13} /> Cancelled</span>
      </div>

      <div className="section-head">
        <div>
          <h2>Tracking and Reviews</h2>
          <p>Prepared for WebSocket rider updates and review image uploads.</p>
        </div>
      </div>
      <div className="profile-grid">
        {activeOrder ? <TrackingPanel orderId={activeOrder.id} /> : <TrackingPanel orderId="waiting-for-order" />}
        <ReviewComposer />
      </div>
    </div>
  );
}
