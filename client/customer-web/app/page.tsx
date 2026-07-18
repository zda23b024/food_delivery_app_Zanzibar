"use client";

import Link from "next/link";
import { Award, Beef, Bell, Coffee, Cookie, Flame, Grid3X3, MapPin, Medal, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Utensils, User, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FoodCard } from "@/components/FoodCard";
import { RestaurantCard } from "@/components/RestaurantCard";
import { api } from "@/services/api";
import type { FoodItem, Restaurant } from "@/types";
import { mapFoodItem, mapRestaurant } from "@/utils/backendMappers";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [message, setMessage] = useState("Loading live restaurants...");

  useEffect(() => {
    Promise.all([api.getRestaurants(), api.getFoodItems()])
      .then(([restaurantData, foodData]) => {
        const mappedRestaurants = (restaurantData as any[]).map(mapRestaurant);
        const mappedFoods = (foodData as any[]).map((item) => mapFoodItem(item, mappedRestaurants));
        setRestaurants(mappedRestaurants);
        setFoods(mappedFoods);
        setMessage(mappedRestaurants.length ? "Live backend data is active." : "No restaurants found in the backend yet.");
      })
      .catch(() => setMessage("Could not load live backend data. Start the backend and refresh."));
  }, []);

  const filteredRestaurants = useMemo(() => {
    const term = query.toLowerCase();
    return restaurants.filter((restaurant) =>
      [restaurant.name, restaurant.cuisine, restaurant.area, restaurant.island].join(" ").toLowerCase().includes(term)
    );
  }, [query, restaurants]);

  const filteredFoods = useMemo(() => {
    const term = query.toLowerCase();
    return foods.filter((item) => [item.name, item.description, item.restaurantName].join(" ").toLowerCase().includes(term));
  }, [foods, query]);

  const categoryChips = [
    { label: "All", icon: Grid3X3 },
    { label: "Nearby", icon: MapPin },
    { label: "Popular", icon: Flame },
    { label: "Pizza", icon: Utensils },
    { label: "Burger", icon: Beef },
    { label: "Seafood", icon: Coffee },
    { label: "Drinks", icon: ShoppingBag },
    { label: "Desserts", icon: Cookie }
  ];
  const mobileCategories = [
    { label: "All", icon: Grid3X3 },
    { label: "Pizza", icon: Flame },
    { label: "Burger", icon: Beef },
    { label: "Seafood", icon: Utensils },
    { label: "Drinks", icon: Coffee }
  ];

  return (
    <div className="home-page">
      <header className="home-topbar">
        <span><MapPin size={15} /> Zanzibar food delivery</span>
        <div className="home-top-actions">
          <Link href="/support" className="top-action-button"><Bell size={17} /><b>1</b></Link>
          <Link href="/cart" className="top-action-button"><ShoppingBag size={17} /><b>2</b></Link>
          <Link href="/profile" className="home-user-chip"><User size={17} /> Zakariya</Link>
        </div>
      </header>

      <section className="app-hero">
        <div className="app-hero-copy">
          <h1>Step into flavor across Zanzibar</h1>
          <p>Browse restaurants, save favorites, add meals to cart, checkout, and track orders from one clean flow.</p>
          <div className="search-bar hero-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, restaurants, or areas" />
            <SlidersHorizontal size={18} />
          </div>
        </div>
        <div className="hero-burger-card">
          <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80" alt="Seafood noodles" />
        </div>
      </section>

      <p className="data-note">{message}</p>

      <div className="desktop-category-strip">
        {categoryChips.map((chip, index) => {
          const Icon = chip.icon;
          return (
            <button className={index === 0 ? "active" : ""} type="button" key={chip.label} onClick={() => setQuery(index === 0 ? "" : chip.label)}>
              <Icon size={14} />
              {chip.label}
            </button>
          );
        })}
        <Link href="/restaurants" aria-label="More categories">›</Link>
      </div>

      <div className="mobile-category-strip">
        {mobileCategories.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.label} onClick={() => setQuery(item.label === "All" ? "" : item.label)}>
              <span><Icon size={18} /></span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="section-head">
        <div>
          <h2>Popular Restaurants</h2>
          <p>Top picks near you with great reviews and fast delivery.</p>
        </div>
        <Link href="/restaurants">View all</Link>
      </div>
      <div className="restaurant-grid">
        {filteredRestaurants.slice(0, 4).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
      </div>
      {filteredRestaurants.length === 0 && <section className="empty-state profile-panel"><strong>No restaurants found</strong><p>Backend returned no matching restaurants.</p></section>}

      <div className="section-head">
        <div>
          <h2>Popular Meals</h2>
          <p>Curated dishes loved by customers.</p>
        </div>
        <Link href="/restaurants">View all</Link>
      </div>
      <div className="food-grid">
        {filteredFoods.slice(0, 6).map((item) => <FoodCard key={item.id} item={item} />)}
      </div>
      {filteredFoods.length === 0 && <section className="empty-state profile-panel"><strong>No menu items found</strong><p>Backend returned no matching food items.</p></section>}

      <section className="home-feature-strip">
        <h2>Why choose Zanmart?</h2>
        <div><Zap size={22} /><span><strong>Lightning Fast Delivery</strong><small>Quick delivery at your doorstep in 25 minutes.</small></span></div>
        <div><Award size={22} /><span><strong>Best Quality</strong><small>Fresh ingredients and hygienic preparation.</small></span></div>
        <div><MapPin size={22} /><span><strong>Live Order Tracking</strong><small>Track your order live from kitchen to home.</small></span></div>
        <div><ShieldCheck size={22} /><span><strong>Secure Payments</strong><small>100% safe and secure payment methods.</small></span></div>
        <div className="feature-bag"><Medal size={42} /></div>
      </section>
    </div>
  );
}
