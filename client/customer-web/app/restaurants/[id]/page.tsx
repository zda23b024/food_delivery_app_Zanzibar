"use client";

import { Clock, MapPin, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartSummary } from "@/components/CartSummary";
import { FoodCard } from "@/components/FoodCard";
import { api } from "@/services/api";
import type { FoodItem, Restaurant } from "@/types";
import { mapFoodItem, mapRestaurant } from "@/utils/backendMappers";
import { formatMoney } from "@/utils/money";

export default function RestaurantDetailsPage({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Loading menu...");

  useEffect(() => {
    Promise.all([api.getRestaurants(), api.getFoodItems()])
      .then(([restaurantData, foodData]) => {
        const mappedRestaurants = (restaurantData as any[]).map(mapRestaurant);
        const selected = mappedRestaurants.find((item) => item.id === params.id) || null;
        const mappedMenu = (foodData as any[])
          .filter((item) => item.restaurant_id === params.id)
          .map((item) => mapFoodItem(item, mappedRestaurants));
        setRestaurant(selected);
        setMenu(mappedMenu);
        setMessage(mappedMenu.length ? "Live menu from backend." : "No menu items found for this restaurant yet.");
      })
      .catch(() => setMessage("Backend unavailable. Start the backend and refresh."));
  }, [params.id]);

  const filteredMenu = useMemo(() => {
    const term = query.toLowerCase();
    return menu.filter((item) => [item.name, item.description, item.category].join(" ").toLowerCase().includes(term));
  }, [menu, query]);

  if (!restaurant) {
    return (
      <section className="empty-state profile-panel">
        <strong>Restaurant not found</strong>
        <p>This restaurant is not available right now.</p>
      </section>
    );
  }

  return (
    <div className="page-grid">
      <div>
        <section className="restaurant-detail-hero">
          <img src={restaurant.image} alt={restaurant.name} />
          <div>
            <span className="app-pill">Menu browsing</span>
            <h1>{restaurant.name}</h1>
            <p>{restaurant.cuisine} in {restaurant.area}. Minimum order {formatMoney(restaurant.minimumOrder)}.</p>
            <div className="tag-row">
              <span><Star size={14} fill="currentColor" /> {restaurant.rating}</span>
              <span><Clock size={14} /> {restaurant.deliveryMinutes} min</span>
              <span><MapPin size={14} /> {restaurant.island}</span>
            </div>
          </div>
        </section>

        <div className="section-head">
          <div>
            <h2>Menu</h2>
            <p>{message}</p>
          </div>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this menu" />
        </div>
        <div className="food-grid">
          {filteredMenu.map((item) => <FoodCard key={item.id} item={item} />)}
        </div>
        {filteredMenu.length === 0 && <section className="empty-state profile-panel"><strong>No menu items found</strong><p>{message}</p></section>}
      </div>
      <CartSummary />
    </div>
  );
}
