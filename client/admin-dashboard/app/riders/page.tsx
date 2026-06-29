"use client";

import { RemoteTable } from "@/components/RemoteTable";
import { riders } from "@/data/mock";
import { adminApi } from "@/services/api";

export default function RidersPage() {
  return (
    <div>
      <div className="page-head"><div><h1>Riders</h1><p>Track rider status, areas, and delivery performance.</p></div></div>
      <RemoteTable
        columns={[
        { key: "name", label: "Rider" },
        { key: "area", label: "Area" },
        { key: "status", label: "Status" },
        { key: "deliveries", label: "Deliveries" }
        ]}
        fallbackRows={riders}
        loadRows={async (token) => {
          const liveRiders = await adminApi.riders(token || "");
          return (liveRiders as any[]).map((rider) => ({
            id: rider.id,
            name: rider.user?.full_name || rider.full_name || rider.id.slice(0, 8),
            area: rider.current_area || rider.vehicle_type || "Unassigned",
            status: rider.is_online ? "Online" : "Offline",
            deliveries: rider.total_deliveries || 0
          }));
        }}
      />
    </div>
  );
}
