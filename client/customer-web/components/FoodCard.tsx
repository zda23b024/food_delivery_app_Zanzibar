"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { FoodItem } from "@/types";
import { formatMoney } from "@/utils/money";

export function FoodCard({ item }: { item: FoodItem }) {
  const { addItem } = useCart();

  return (
    <article className="food-card">
      <div className="food-media">
        <img src={item.image} alt={item.name} />
      </div>

      <div className="food-body">
        <div className="card-top">
          <div>
            <h3>{item.name}</h3>
            <p>{item.restaurantName}</p>
          </div>
          <strong className="food-price">{formatMoney(item.price)}</strong>
        </div>

        <div className="food-footer">
          <button className="primary-button add-to-cart" type="button" onClick={() => addItem(item)}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
