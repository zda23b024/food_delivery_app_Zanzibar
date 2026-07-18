"use client";

import Link from "next/link";
import { Beef, Coffee, Cookie, Flame, Grid3X3, Heart, Hotel, LayoutGrid, List, MapPin, Search, SlidersHorizontal, Star, Umbrella, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFavorites } from "@/contexts/FavoriteContext";
import { api } from "@/services/api";
import type { Restaurant } from "@/types";
import { mapRestaurant } from "@/utils/backendMappers";
import { formatMoney } from "@/utils/money";

const areas = ["All", "Stone Town", "Darajani", "Nungwi", "Paje", "Chake-Chake", "Hotel delivery", "Beach delivery"];
const categories = [
  { label: "Nearby", icon: MapPin },
  { label: "Popular", icon: Star },
  { label: "Pizza", icon: Utensils },
  { label: "Burger", icon: Beef },
  { label: "Seafood", icon: Flame },
  { label: "Drinks", icon: Coffee },
  { label: "Desserts", icon: Cookie },
  { label: "More", icon: Grid3X3 }
];

export default function RestaurantsPage() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [message, setMessage] = useState("Loading live restaurant list...");

  useEffect(() => {
    api
      .getRestaurants()
      .then((data) => {
        const mapped = (data as any[]).map(mapRestaurant);
        setRestaurants(mapped);
        setMessage(mapped.length ? "Showing backend restaurants from Neon." : "No restaurants found in the backend yet.");
      })
      .catch(() => setMessage("Backend unavailable. Start the backend and refresh."));
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesQuery = [restaurant.name, restaurant.cuisine, restaurant.area, restaurant.island].join(" ").toLowerCase().includes(term);
      const matchesArea =
        area === "All" ||
        restaurant.area.toLowerCase().includes(area.toLowerCase()) ||
        (area === "Hotel delivery" && restaurant.supportsHotel) ||
        (area === "Beach delivery" && restaurant.supportsBeach);
      return matchesQuery && matchesArea;
    });
  }, [area, query, restaurants]);

  return (
    <div className="restaurants-page">
      <header className="home-topbar restaurants-topbar">
        <span><MapPin size={15} /> Stone Town, Zanzibar</span>
        <div className="home-top-actions">
          <Link href="/support" className="top-action-button"><SlidersHorizontal size={17} /><b>3</b></Link>
          <Link href="/cart" className="top-action-button"><LayoutGrid size={17} /><b>0</b></Link>
          <Link href="/profile" className="home-user-chip">Zakariya</Link>
        </div>
      </header>

      <section className="restaurants-hero">
        <div>
          <span className="app-pill"><SlidersHorizontal size={16} /> Restaurant browsing</span>
          <h1>Find your <span>next meal</span></h1>
          <p>Search by location, cuisine, hotel delivery, or beach delivery.</p>
          <div className="search-bar restaurant-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search restaurants in Stone Town, Nungwi, Pemba..." />
            <button type="button" aria-label="Search" onClick={() => setQuery(query.trim())}><Search size={18} /></button>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80" alt="Zanzibar rice meal" />
      </section>

      <div className="restaurant-area-strip">
        {areas.map((item) => (
          <button key={item} className={area === item ? "filter-chip active" : "filter-chip"} onClick={() => setArea(item)}>
            {item === "All" ? null : item === "Hotel delivery" ? <Hotel size={13} /> : item === "Beach delivery" ? <Umbrella size={13} /> : <MapPin size={13} />}
            {item}
          </button>
        ))}
      </div>

      <div className="restaurant-category-row">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.label} onClick={() => setQuery(item.label === "More" ? "" : item.label)}>
              <span><Icon size={20} /></span>
              {item.label}
            </button>
          );
        })}
        <button className="restaurant-filter-button" type="button" onClick={() => setArea("All")}>Filter <SlidersHorizontal size={15} /></button>
      </div>

      <div className="restaurant-list-head">
        <p>Showing <strong>{filtered.length || restaurants.length}</strong> restaurants</p>
        <div>
          <button type="button" onClick={() => setQuery("")}>Sort by: <strong>Popular</strong></button>
          <button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Grid view" onClick={() => setViewMode("grid")}><LayoutGrid size={16} /></button>
          <button type="button" className={viewMode === "list" ? "active" : ""} aria-label="List view" onClick={() => setViewMode("list")}><List size={16} /></button>
        </div>
      </div>

      <p className="data-note">{message}</p>
      <div className={viewMode === "list" ? "restaurants-browse-grid list-view" : "restaurants-browse-grid"}>
        {filtered.map((restaurant, index) => <BrowseRestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />)}
      </div>
      {filtered.length === 0 && <section className="empty-state profile-panel"><strong>No restaurants found</strong><p>Try a different search or seed restaurant data in the backend.</p></section>}

      <section className="home-feature-strip restaurants-feature-strip">
        <div><Flame size={22} /><span><strong>Lightning Fast Delivery</strong><small>On-time delivery at your doorstep.</small></span></div>
        <div><Star size={22} /><span><strong>Best Quality</strong><small>Fresh ingredients and hygienic preparation.</small></span></div>
        <div><MapPin size={22} /><span><strong>Live Order Tracking</strong><small>Track your order in real time.</small></span></div>
        <div><Hotel size={22} /><span><strong>Secure Payments</strong><small>100% safe and secure payment methods.</small></span></div>
      </section>
    </div>
  );
}

function BrowseRestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  const { isFavoriteRestaurant, toggleRestaurantFavorite } = useFavorites();
  const favorite = isFavoriteRestaurant(restaurant.id);
  const labels = ["Best for lunch", "Popular choice", "Most ordered", "Cozy place"];

  return (
    <article className="browse-restaurant-card">
      <div className="restaurant-media">
        <Link href={`/restaurants/${restaurant.id}`}>
          <img src={restaurant.image} alt={restaurant.name} />
        </Link>
        <span className="time-badge">20-35 min</span>
        <button
          className={favorite ? "icon-button small favorite floating active" : "icon-button small favorite floating"}
          onClick={() => toggleRestaurantFavorite(restaurant.id)}
          aria-label={`Favorite ${restaurant.name}`}
          type="button"
        >
          <Heart size={15} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="browse-restaurant-body">
        <Link href={`/restaurants/${restaurant.id}`} className="card-title">{restaurant.name}</Link>
        <p>{restaurant.cuisine} - {restaurant.area}</p>
        <div className="browse-rating"><Star size={13} fill="currentColor" /> {restaurant.rating} <span>({180 + index * 40}+)</span></div>
        <small>Min order {formatMoney(restaurant.minimumOrder)} · Delivery {formatMoney(restaurant.deliveryFee)}</small>
        <div className="browse-card-bottom">
          <span>{labels[index % labels.length]}</span>
          <Link href={`/restaurants/${restaurant.id}`}>View Menu →</Link>
        </div>
      </div>
    </article>
  );
}
