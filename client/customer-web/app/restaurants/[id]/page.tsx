import { notFound } from "next/navigation";
import { Clock, MapPin, Star } from "lucide-react";
import { CartSummary } from "@/components/CartSummary";
import { FoodCard } from "@/components/FoodCard";
import { foodItems, restaurants } from "@/data/mock";
import { formatMoney } from "@/utils/money";

export default function RestaurantDetailsPage({ params }: { params: { id: string } }) {
  const restaurant = restaurants.find((item) => item.id === params.id);
  if (!restaurant) {
    notFound();
  }

  const menu = foodItems.filter((item) => item.restaurantId === restaurant.id);

  return (
    <div className="page-grid">
      <div>
        <section className="hero">
          <img src={restaurant.image} alt={restaurant.name} />
          <div className="hero-copy">
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
            <p>Choose items and add them to your cart.</p>
          </div>
        </div>
        <div className="food-grid">
          {menu.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
      <CartSummary />
    </div>
  );
}
