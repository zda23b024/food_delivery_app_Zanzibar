import Link from "next/link";
import { Search } from "lucide-react";
import { FoodCard } from "@/components/FoodCard";
import { RestaurantCard } from "@/components/RestaurantCard";
import { CartSummary } from "@/components/CartSummary";
import { foodItems, restaurants } from "@/data/mock";

export default function HomePage() {
  return (
    <div className="page-grid">
      <div>
        <section className="hero">
          <img src="https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=1600&q=80" alt="Fresh Zanzibar food" />
          <div className="hero-copy">
            <h1>ZanMeal</h1>
            <p>Order from trusted restaurants across Stone Town, tourist areas, universities, neighborhoods, and Pemba-ready service zones.</p>
            <div className="search-bar">
              <Search size={18} />
              <input placeholder="Search meals, restaurants, or areas" aria-label="Search ZanMeal" />
            </div>
          </div>
        </section>

        <div className="section-head">
          <div>
            <h2>Popular Restaurants</h2>
            <p>Fast delivery, local favorites, and hotel-friendly options.</p>
          </div>
          <Link href="/restaurants">View all</Link>
        </div>
        <div className="restaurant-grid">
          {restaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        <div className="section-head">
          <div>
            <h2>Recommended Meals</h2>
            <p>Good picks for lunch, dinner, beach delivery, and repeat orders.</p>
          </div>
        </div>
        <div className="food-grid">
          {foodItems.slice(0, 4).map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
      <CartSummary />
    </div>
  );
}
