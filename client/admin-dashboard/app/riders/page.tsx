"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Wifi } from "lucide-react";
import { LiveTable } from "@/components/LiveTable";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";

type RiderRow = { id: string; name: string; area: string; status: string; deliveries: number };

export default function RidersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<RiderRow[]>([]);
  const [message, setMessage] = useState("Login as admin to load riders.");

  async function load() {
    if (!token) return;
    try {
      const liveRiders = await adminApi.riders(token);
      setRows((liveRiders as any[]).map((rider) => ({
        id: rider.id,
        name: rider.user?.full_name || rider.full_name || rider.id.slice(0, 8),
        area: rider.service_area || rider.vehicle_type || "Unassigned",
        status: rider.is_online ? "Online" : "Offline",
        deliveries: rider.total_deliveries || 0
      })));
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load riders.");
    }
  }

  async function toggle(row: RiderRow) {
    if (!token) return;
    const nextOnline = row.status !== "Online";
    await adminApi.updateRider(row.id, { is_online: nextOnline, is_available: nextOnline }, token);
    await load();
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="page-head">
        <div><h1>Riders</h1><p>Track rider status, areas, and delivery performance.</p></div>
        <button className="primary-button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>
      {message && <p className="muted">{message}</p>}
      <LiveTable columns={[
        { key: "name", label: "Rider" },
        { key: "area", label: "Area" },
        { key: "status", label: "Status" },
        { key: "deliveries", label: "Deliveries" }
      ]} rows={rows} actions={(row) => (
        <button className="mini-button" onClick={() => toggle(row)}><Wifi size={14} /> {row.status === "Online" ? "Set Offline" : "Set Online"}</button>
      )} />
    </div>
  );
}
