"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Clock, DollarSign, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { OrderTable } from "@/components/OrderTable";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import type { MenuItem, RestaurantOrder } from "@/types";
import { findOwnedRestaurant, mapMenuItem, mapOrder } from "@/utils/backend";
import { formatMoney } from "@/utils/money";

export default function OverviewPage() {
  const { accessToken, user } = useAuth();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [message, setMessage] = useState("Login to load live restaurant data.");

  useEffect(() => {
    if (!accessToken || !user?.id) return;
    let active = true;
    setMessage("Loading live dashboard...");
    Promise.all([restaurantApi.getRestaurants(), restaurantApi.getOrders(accessToken)])
      .then(async ([restaurants, liveOrders]) => {
        const owned = findOwnedRestaurant(restaurants as any[], user.id);
        const liveMenu = owned ? await restaurantApi.getFoodItems(owned.id, accessToken) : [];
        if (!active) return;
        setRestaurantName(owned?.name || "Restaurant");
        setOrders((liveOrders as any[]).map(mapOrder));
        setMenuItems((liveMenu as any[]).map(mapMenuItem));
        setMessage(owned ? "" : "No restaurant profile is linked to this account yet.");
      })
      .catch((error: Error) => setMessage(error.message));
    return () => {
      active = false;
    };
  }, [accessToken, user?.id]);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pending = orders.filter((order) => ["pending", "accepted", "preparing"].includes(order.status)).length;
  const featured = menuItems.filter((item) => item.featured).length;
  const averagePrep = useMemo(() => {
    if (!menuItems.length) return "0 min";
    return `${Math.round(menuItems.reduce((sum, item) => sum + item.prepMinutes, 0) / menuItems.length)} min`;
  }, [menuItems]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{restaurantName} Overview</h1>
          <p>Monitor orders, revenue, menu availability, and service readiness.</p>
        </div>
        <Link href="/menu/new" className="primary-button">Add Food Item</Link>
      </div>
      {message && <p className="muted">{message}</p>}

      <div className="stats-grid">
        <StatCard label="Today Revenue" value={formatMoney(revenue)} hint="From live backend orders" icon={DollarSign} />
        <StatCard label="Active Orders" value={String(pending)} hint="Need restaurant attention" icon={ShoppingBag} />
        <StatCard label="Avg Prep Time" value={averagePrep} hint="Based on live menu items" icon={Clock} />
        <StatCard label="Menu Items" value={String(menuItems.length)} hint={`${featured} featured today`} icon={BadgePercent} />
      </div>

      <div className="page-head">
        <div>
          <h1>Live Orders</h1>
          <p>Accept, prepare, and mark orders ready for pickup.</p>
        </div>
      </div>
      <OrderTable orders={orders.slice(0, 5)} />
    </div>
  );
}
