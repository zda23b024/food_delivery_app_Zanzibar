import { Search } from "lucide-react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/data/mock";

export default function RestaurantsPage() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Restaurants</h2>
          <p>Search Zanzibar restaurants by area, cuisine, hotel delivery, or beach service.</p>
        </div>
      </div>
      <div className="search-bar">
        <Search size={18} />
        <input placeholder="Search restaurants in Stone Town, Nungwi, Pemba..." aria-label="Search restaurants" />
      </div>
      <div className="section-head">
        <div className="tag-row">
          <span>All</span>
          <span>Stone Town</span>
          <span>Nungwi</span>
          <span>Pemba</span>
          <span>Hotel delivery</span>
          <span>Beach delivery</span>
        </div>
      </div>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
