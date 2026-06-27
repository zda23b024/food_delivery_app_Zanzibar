"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Hotel, Star, Umbrella } from "lucide-react";
import type { Restaurant } from "@/types";
import { formatMoney } from "@/utils/money";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [favorite, setFavorite] = useState(Boolean(restaurant.isFavorite));

  return (
    <article className="restaurant-card">
      <Link href={`/restaurants/${restaurant.id}`} className="restaurant-media">
        <img src={restaurant.image} alt={restaurant.name} />
      </Link>
      <div className="restaurant-body">
        <div className="row between">
          <Link href={`/restaurants/${restaurant.id}`} className="card-title">
            {restaurant.name}
          </Link>
          <button className="icon-button small" onClick={() => setFavorite((value) => !value)} aria-label={`Favorite ${restaurant.name}`}>
            <Heart size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <p>{restaurant.cuisine} - {restaurant.area}</p>
        <div className="meta-grid">
          <span><Star size={14} fill="currentColor" /> {restaurant.rating}</span>
          <span>{restaurant.deliveryMinutes} min</span>
          <span>{formatMoney(restaurant.deliveryFee)}</span>
        </div>
        <div className="tag-row">
          {restaurant.tags.map((tag) => <span key={tag}>{tag}</span>)}
          {restaurant.supportsHotel && <span><Hotel size={13} /> Hotel</span>}
          {restaurant.supportsBeach && <span><Umbrella size={13} /> Beach</span>}
        </div>
      </div>
    </article>
  );
}
