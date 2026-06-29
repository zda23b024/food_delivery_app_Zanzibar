"use client";

import { RemoteTable } from "@/components/RemoteTable";
import { restaurants } from "@/data/mock";
import { adminApi } from "@/services/api";

export default function RestaurantsPage() {
  return (
    <div>
      <div className="page-head"><div><h1>Restaurants</h1><p>Approve vendors, monitor ratings, and manage coverage.</p></div></div>
      <RemoteTable
        columns={[
        { key: "name", label: "Restaurant" },
        { key: "area", label: "Area" },
        { key: "status", label: "Status" },
        { key: "rating", label: "Rating" }
        ]}
        fallbackRows={restaurants}
        loginRequired={false}
        loadRows={async () => {
          const liveRestaurants = await adminApi.restaurants();
          return (liveRestaurants as any[]).map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            area: restaurant.area || restaurant.island || "Zanzibar",
            status: restaurant.is_active ? "Active" : "Inactive",
            rating: Number(restaurant.average_rating || 0).toFixed(1)
          }));
        }}
      />
    </div>
  );
}
