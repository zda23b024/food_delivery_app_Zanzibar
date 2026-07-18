"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useFavorites } from "@/contexts/FavoriteContext";
import type { Restaurant } from "@/types";
import { formatMoney } from "@/utils/money";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { isFavoriteRestaurant, toggleRestaurantFavorite } = useFavorites();
  const favorite = isFavoriteRestaurant(restaurant.id);
  const deliveryMinutes = Number.parseInt(String(restaurant.deliveryMinutes || "25"), 10) || 25;

  return (
    <article className="restaurant-card">
      <div className="restaurant-media">
        <Link href={`/restaurants/${restaurant.id}`}>
          <img src={restaurant.image} alt={restaurant.name} />
        </Link>
        <button
          className={favorite ? "icon-button small favorite floating active" : "icon-button small favorite floating"}
          onClick={() => toggleRestaurantFavorite(restaurant.id)}
          aria-label={`Favorite ${restaurant.name}`}
          type="button"
        >
          <Heart size={16} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="restaurant-body">
        <span className="time-badge">{Math.max(10, deliveryMinutes - 5)}-{deliveryMinutes} min</span>
        <Link href={`/restaurants/${restaurant.id}`} className="card-title">
          {restaurant.name}
        </Link>
        <p>{restaurant.cuisine} - {restaurant.area}</p>
        <div className="meta-grid">
          <span><Star size={14} fill="currentColor" /> {restaurant.rating}</span>
        </div>
        <small>Delivery from {formatMoney(restaurant.deliveryFee)}</small>
      </div>
    </article>
  );
}
