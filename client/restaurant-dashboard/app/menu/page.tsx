"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { menuItems } from "@/data/mock";
import { restaurantApi } from "@/services/api";
import { formatMoney } from "@/utils/money";
import type { MenuItem } from "@/types";

export default function MenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [message, setMessage] = useState("Loading menu from backend...");

  useEffect(() => {
    let active = true;
    restaurantApi
      .getRestaurants()
      .then(async (restaurants) => {
        const ownedRestaurant = (restaurants as any[]).find((restaurant) => restaurant.owner_id === user?.id);
        const liveItems = await restaurantApi.getFoodItems(ownedRestaurant?.id);
        if (!active) return;
        const mapped = (liveItems as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category_id || "Menu",
          price: Number(item.price || 0),
          available: item.is_available,
          featured: item.is_featured,
          prepMinutes: item.preparation_time_minutes || 20,
          image: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
        }));
        setItems(mapped);
        setMessage(mapped.length ? "" : "No backend menu items yet. Add your first item.");
      })
      .catch((error: Error) => setMessage(`${error.message}. Showing demo menu until backend data is available.`));
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Menu</h1>
          <p>Add, edit, feature, and temporarily disable food items.</p>
        </div>
        <Link href="/menu/new" className="primary-button">
          <Plus size={17} />
          Add Food Item
        </Link>
      </div>

      {message && <p className="muted">{message}</p>}
      <div className="menu-grid">
        {items.map((item) => (
          <article className="menu-card" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div className="menu-body">
              <div className="row between">
                <strong>{item.name}</strong>
                <Link href={`/menu/${item.id}`} className="icon-command" aria-label={`Edit ${item.name}`}>
                  <Pencil size={16} />
                </Link>
              </div>
              <span className="muted">{item.category} - {item.prepMinutes} min</span>
              <div className="row between">
                <strong>{formatMoney(item.price)}</strong>
                <span className={item.available ? "tag green" : "tag"}>
                  {item.available ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
