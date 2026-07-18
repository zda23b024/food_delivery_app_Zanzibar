"use client";

import { CheckCircle2, Clock, PackageCheck, XCircle } from "lucide-react";
import type { RestaurantOrder } from "@/types";
import { formatMoney } from "@/utils/money";

const nextStatus: Record<string, string> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready_for_pickup",
  ready_for_pickup: "picked_up",
  picked_up: "delivered"
};

const actionLabels: Record<string, string> = {
  accepted: "Accept",
  preparing: "Start prep",
  ready_for_pickup: "Ready",
  picked_up: "Hand off",
  delivered: "Complete"
};

export function OrderTable({
  orders,
  onAdvance
}: {
  orders: RestaurantOrder[];
  onAdvance?: (orderId: string, status: string) => void;
}) {
  return (
    <div className="table-card">
      <div className="table-head">
        <span>Order</span>
        <span>Customer</span>
        <span>Items</span>
        <span>Status</span>
        <span>Total</span>
        <span>Action</span>
      </div>
      {orders.length === 0 ? (
        <div className="table-row empty-row">
          <span>No live orders found.</span>
        </div>
      ) : orders.map((order) => (
        <div className="table-row" key={order.id}>
          <span>
            <strong>{order.orderNumber}</strong>
            <small>{order.placedAt} - {order.deliveryType}</small>
          </span>
          <span>{order.customerName}</span>
          <span>{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</span>
          <span className={`status-pill ${order.status}`}>
            {order.status === "delivered" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            {order.status.replaceAll("_", " ")}
          </span>
          <strong>{formatMoney(order.total)}</strong>
          <span className="table-actions">
            <button
              className="mini-button"
              disabled={!nextStatus[order.status]}
              onClick={() => nextStatus[order.status] && onAdvance?.(order.id, nextStatus[order.status])}
              aria-label={`Advance ${order.orderNumber}`}
            >
              <PackageCheck size={15} />
              {nextStatus[order.status] ? actionLabels[nextStatus[order.status]] : "Done"}
            </button>
            {!["delivered", "cancelled"].includes(order.status) && (
              <button className="mini-button danger" onClick={() => onAdvance?.(order.id, "cancelled")} aria-label={`Cancel ${order.orderNumber}`}>
                <XCircle size={15} />
                Cancel
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
