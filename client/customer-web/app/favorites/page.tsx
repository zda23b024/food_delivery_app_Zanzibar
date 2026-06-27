import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { foodItems, restaurants } from "@/data/mock";

export default function FavoritesPage() {
  const favoriteRestaurants = restaurants.filter((restaurant) => restaurant.isFavorite);

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Favorites</h2>
          <p>Saved restaurants and meals for quick repeat orders.</p>
        </div>
      </div>
      <div className="restaurant-grid">
        {favoriteRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
      <div className="section-head">
        <div>
          <h2>Saved Meals</h2>
          <p>Your likely repeat picks.</p>
        </div>
      </div>
      <div className="food-grid">
        {foodItems.slice(0, 2).map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
