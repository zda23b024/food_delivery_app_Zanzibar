"use client";

import { RemoteTable } from "@/components/RemoteTable";
import { orders } from "@/data/mock";
import { adminApi } from "@/services/api";

export default function OrdersPage() {
  return (
    <div>
      <div className="page-head"><div><h1>Orders</h1><p>Monitor platform order flow and exceptions.</p></div></div>
      <RemoteTable
        columns={[
        { key: "id", label: "Order" },
        { key: "customer", label: "Customer" },
        { key: "restaurant", label: "Restaurant" },
        { key: "status", label: "Status" },
        { key: "total", label: "Total" }
        ]}
        fallbackRows={orders}
        loadRows={async (token) => {
          const liveOrders = await adminApi.orders(token || "");
          return (liveOrders as any[]).map((order) => ({
            id: order.order_number || order.id.slice(0, 8),
            customer: order.customer_id?.slice(0, 8) || "Customer",
            restaurant: order.restaurant_id?.slice(0, 8) || "Restaurant",
            status: order.status,
            total: `TZS ${Number(order.total_amount || 0).toLocaleString()}`
          }));
        }}
      />
    </div>
  );
}
