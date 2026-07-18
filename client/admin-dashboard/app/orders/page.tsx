"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { LiveTable } from "@/components/LiveTable";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";

const orderStatuses = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "ready_for_pickup",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled"
];

type OrderRow = {
  id: string;
  order: string;
  customer: string;
  restaurant: string;
  status: string;
  total: string;
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("Login as admin to load orders.");

  async function load() {
    if (!token) return;
    setMessage("Loading orders...");
    try {
      const liveOrders = await adminApi.orders(token);
      setRows((liveOrders as any[]).map((order) => ({
        id: order.id,
        order: order.order_number || order.id.slice(0, 8),
        customer: order.customer?.full_name || order.customer_id?.slice(0, 8) || "Customer",
        restaurant: order.restaurant?.name || order.restaurant_id?.slice(0, 8) || "Restaurant",
        status: order.status,
        total: `TZS ${Number(order.total_amount || 0).toLocaleString()}`
      })));
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load orders.");
    }
  }

  async function changeStatus(orderId: string, status: string) {
    if (!token) return setMessage("Login as admin to update orders.");
    setMessage("Updating order status...");
    try {
      await adminApi.updateOrderStatus(orderId, status, token);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update order.");
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="page-head">
        <div><h1>Orders</h1><p>Monitor platform order flow and exceptions.</p></div>
        <button className="primary-button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>
      {message && <p className="muted">{message}</p>}
      <LiveTable columns={[
        { key: "id", label: "Order" },
        { key: "customer", label: "Customer" },
        { key: "restaurant", label: "Restaurant" },
        { key: "status", label: "Status" },
        { key: "total", label: "Total" }
      ]} rows={rows} actions={(row) => (
        <select className="inline-select" value={row.status} onChange={(event) => changeStatus(row.id, event.target.value)}>
          {orderStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
        </select>
      )} />
    </div>
  );
}
