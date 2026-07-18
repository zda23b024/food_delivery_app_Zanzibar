"use client";

import { useEffect, useState } from "react";
import { Power, RefreshCw } from "lucide-react";
import { LiveTable } from "@/components/LiveTable";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";

type RestaurantRow = { id: string; name: string; area: string; status: string; rating: string };

export default function RestaurantsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<RestaurantRow[]>([]);
  const [message, setMessage] = useState("Loading restaurants...");

  async function load() {
    try {
      const liveRestaurants = await adminApi.restaurants();
      setRows((liveRestaurants as any[]).map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        area: restaurant.area || restaurant.island || "Zanzibar",
        status: restaurant.is_active ? "Active" : "Inactive",
        rating: Number(restaurant.average_rating || 0).toFixed(1)
      })));
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load restaurants.");
    }
  }

  async function toggle(row: RestaurantRow) {
    if (!token) return setMessage("Login as admin to update restaurants.");
    await adminApi.updateRestaurant(row.id, { is_active: row.status !== "Active" }, token);
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-head">
        <div><h1>Restaurants</h1><p>Approve vendors, monitor ratings, and manage coverage.</p></div>
        <button className="primary-button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>
      {message && <p className="muted">{message}</p>}
      <LiveTable columns={[
        { key: "name", label: "Restaurant" },
        { key: "area", label: "Area" },
        { key: "status", label: "Status" },
        { key: "rating", label: "Rating" }
      ]} rows={rows} actions={(row) => (
        <button className="mini-button" onClick={() => toggle(row)}><Power size={14} /> {row.status === "Active" ? "Disable" : "Enable"}</button>
      )} />
    </div>
  );
}
