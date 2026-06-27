"use client";

import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { FoodItem } from "@/types";
import { formatMoney } from "@/utils/money";

export function FoodCard({ item }: { item: FoodItem }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="food-card">
      <img src={item.image} alt={item.name} />
      <div>
        <div className="row between">
          <h3>{item.name}</h3>
          <div className="row">
            <button className="icon-button small" onClick={() => setFavorite((value) => !value)} aria-label={`Favorite ${item.name}`}>
              <Heart size={15} fill={favorite ? "currentColor" : "none"} />
            </button>
            <button className="icon-button add" onClick={() => addItem(item)} aria-label={`Add ${item.name}`}>
              <Plus size={18} />
            </button>
          </div>
        </div>
        <p>{item.description}</p>
        <div className="row food-meta">
          <strong>{formatMoney(item.price)}</strong>
          <span>{item.prepMinutes} min</span>
          {item.spicy && <span>{item.spicy}</span>}
        </div>
      </div>
    </article>
  );
}
