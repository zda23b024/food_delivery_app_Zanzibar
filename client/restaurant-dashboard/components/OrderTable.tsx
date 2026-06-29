"use client";

import { CheckCircle2, Clock, PackageCheck } from "lucide-react";
import type { RestaurantOrder } from "@/types";
import { formatMoney } from "@/utils/money";

const nextStatus: Record<string, string> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready_for_pickup",
  ready_for_pickup: "picked_up",
  picked_up: "delivered"
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
      {orders.map((order) => (
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
          <button
            className="icon-command"
            disabled={!nextStatus[order.status]}
            onClick={() => nextStatus[order.status] && onAdvance?.(order.id, nextStatus[order.status])}
            aria-label={`Advance ${order.orderNumber}`}
          >
            <PackageCheck size={17} />
          </button>
        </div>
      ))}
    </div>
  );
}
