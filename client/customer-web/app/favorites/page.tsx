"use client";

import Link from "next/link";
import { Bell, Heart, MapPin, MoreVertical, ShoppingCart, Star, Truck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoriteContext";
import { api } from "@/services/api";
import type { FoodItem, Restaurant } from "@/types";
import { mapFoodItem, mapRestaurant } from "@/utils/backendMappers";
import { formatMoney } from "@/utils/money";

export default function FavoritesPage() {
  const { favoriteFoodIds, favoriteRestaurantIds, toggleRestaurantFavorite } = useFavorites();
  const { addItem } = useCart();
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [message, setMessage] = useState("Loading favorite records from backend...");

  useEffect(() => {
    Promise.all([api.getRestaurants(), api.getFoodItems()])
      .then(([restaurantData, foodData]) => {
        const mappedRestaurants = (restaurantData as any[]).map(mapRestaurant);
        setAllRestaurants(mappedRestaurants);
        setAllFoods((foodData as any[]).map((item) => mapFoodItem(item, mappedRestaurants)));
        setMessage("Showing favorites against live backend data.");
      })
      .catch(() => setMessage("Could not load live backend favorites data."));
  }, []);

  const favoriteRestaurants = allRestaurants.filter((restaurant) => favoriteRestaurantIds.includes(restaurant.id));
  const favoriteMeals = allFoods.filter((item) => favoriteFoodIds.includes(item.id));
  const restaurantRows = (favoriteRestaurants.length ? favoriteRestaurants : allRestaurants).slice(0, 4);
  const mealRows = (favoriteMeals.length ? favoriteMeals : allFoods).slice(0, 4);

  return (
    <div className="favorites-page">
      <header className="home-topbar favorites-topbar">
        <span><MapPin size={15} /> Stone Town, Zanzibar</span>
        <div className="home-top-actions">
          <Link href="/support" className="top-action-button"><Bell size={17} /><b>3</b></Link>
          <Link href="/cart" className="top-action-button"><ShoppingCart size={17} /><b>0</b></Link>
          <Link href="/profile" className="home-user-chip"><User size={17} /> Zakariya <small>Customer</small></Link>
        </div>
      </header>

      <section className="favorites-hero">
        <div>
          <span className="app-pill"><Heart size={15} /> Favorites</span>
          <h1>Saved picks</h1>
          <p>Saved restaurants and meals for a quick repeat orders.</p>
        </div>
        <div className="favorites-hero-art">
          <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80" alt="Saved meal" />
          <Heart size={26} fill="currentColor" />
        </div>
      </section>

      <p className="data-note">{message}</p>

      <section className="favorites-section">
        <h2>Quick access to your favorite restaurants</h2>
        <div className="favorites-restaurant-grid">
          {restaurantRows.map((restaurant, index) => (
            <article className="favorite-restaurant-card" key={restaurant.id}>
              <div className="restaurant-media">
                <Link href={`/restaurants/${restaurant.id}`}>
                  <img src={restaurant.image} alt={restaurant.name} />
                </Link>
                <span className="favorite-rating"><Star size={12} fill="currentColor" /> {restaurant.rating}</span>
                <button
                  className="icon-button small favorite floating active"
                  onClick={() => toggleRestaurantFavorite(restaurant.id)}
                  aria-label={`Remove favorite ${restaurant.name}`}
                  type="button"
                >
                  <Heart size={15} fill="currentColor" />
                </button>
              </div>
              <div>
                <span className="time-badge">20-{25 + index * 5} min</span>
                <Link href={`/restaurants/${restaurant.id}`} className="card-title">{restaurant.name}</Link>
                <p>{restaurant.cuisine} - {restaurant.area}</p>
                <small>Delivery from {formatMoney(restaurant.deliveryFee)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="favorites-section">
        <h2>Your saved meals</h2>
        <p>Your likely repeat picks.</p>
        <div className="saved-meals-list">
          {mealRows.map((item, index) => (
            <article className="saved-meal-row" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <span>{item.restaurantName || "Zanmart restaurant"}</span>
                <small>{formatMoney(item.price)}</small>
              </div>
              <span className="meal-rating"><Star size={13} fill="currentColor" /> 4.{8 - index} <small>({320 - index * 40}+)</small></span>
              <button type="button" onClick={() => addItem(item)}><ShoppingCart size={15} /> Add to Cart</button>
              <MoreVertical size={18} />
            </article>
          ))}
        </div>
      </section>

      <section className="favorites-empty-prompt">
        <div>
          <strong>No saved meals yet?</strong>
          <p>Save your favorite meals and restaurants to reorder faster next time.</p>
        </div>
        <Link href="/restaurants"><Heart size={16} /> Browse Restaurants</Link>
      </section>
    </div>
  );
}
