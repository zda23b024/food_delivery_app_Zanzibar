"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import { formatMoney } from "@/utils/money";
import type { MenuItem } from "@/types";
import { findOwnedRestaurant, mapMenuItem } from "@/utils/backend";

export default function MenuPage() {
  const { accessToken, user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [message, setMessage] = useState("Loading menu from backend...");

  async function loadMenu(active = true) {
    if (!user?.id) {
      setMessage("Login as a restaurant owner to load your menu.");
      return;
    }
    restaurantApi
      .getRestaurants()
      .then(async (restaurants) => {
        const ownedRestaurant = findOwnedRestaurant(restaurants as any[], user?.id);
        const liveItems = ownedRestaurant ? await restaurantApi.getFoodItems(ownedRestaurant.id, accessToken) : [];
        if (!active) return;
        const mapped = (liveItems as any[]).map(mapMenuItem);
        setItems(mapped);
        setMessage(ownedRestaurant ? (mapped.length ? "" : "No backend menu items yet. Add your first item.") : "No restaurant profile is linked to this account yet.");
      })
      .catch((error: Error) => setMessage(error.message));
  }

  useEffect(() => {
    let active = true;
    loadMenu(active);
    return () => {
      active = false;
    };
  }, [accessToken, user?.id]);

  async function toggleAvailability(item: MenuItem) {
    if (!accessToken) {
      setMessage("Login first to update menu items.");
      return;
    }
    try {
      await restaurantApi.updateFoodItem(item.id, { is_available: !item.available }, accessToken);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, available: !entry.available } : entry));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update item availability.");
    }
  }

  async function deleteItem(item: MenuItem) {
    if (!accessToken) {
      setMessage("Login first to delete menu items.");
      return;
    }
    try {
      await restaurantApi.deleteFoodItem(item.id, accessToken);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setMessage(`${item.name} removed from the live menu.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete menu item.");
    }
  }

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
                <div className="row">
                  <button className="icon-command" onClick={() => toggleAvailability(item)} aria-label={`Toggle ${item.name}`}>
                    {item.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <Link href={`/menu/${item.id}`} className="icon-command" aria-label={`Edit ${item.name}`}>
                    <Pencil size={16} />
                  </Link>
                  <button className="icon-command danger" onClick={() => deleteItem(item)} aria-label={`Delete ${item.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
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
