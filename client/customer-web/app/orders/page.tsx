"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ReviewComposer } from "@/components/ReviewComposer";
import { TrackingPanel } from "@/components/TrackingPanel";
import { orders } from "@/data/mock";
import { formatMoney } from "@/utils/money";

const nextStatuses = ["Pending", "Accepted", "Preparing", "Ready", "Picked Up", "Delivered"];

export default function OrdersPage() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Orders</h2>
          <p>Track active orders and review past deliveries.</p>
        </div>
      </div>

      <div className="order-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <div className="row">
                {order.status === "Delivered" ? <CheckCircle2 size={20} color="#22c55e" /> : <Clock size={20} color="#d95700" />}
                <strong>{order.id}</strong>
                <span className={`status-pill ${order.status.toLowerCase().replace(" ", "-")}`}>{order.status}</span>
              </div>
              <p>{order.restaurantName} - {order.items.join(", ")}</p>
              <small>{order.placedAt} - ETA {order.eta}</small>
            </div>
            <strong>{formatMoney(order.total)}</strong>
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
        <TrackingPanel orderId="ZM-9041AA" />
        <ReviewComposer />
      </div>
    </div>
  );
}
