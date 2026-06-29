"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";

export default function NewMenuItemPage() {
  const { accessToken, user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Local Meals");
  const [price, setPrice] = useState("12000");
  const [prepMinutes, setPrepMinutes] = useState("18");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    restaurantApi
      .getRestaurants()
      .then((restaurants) => {
        const ownedRestaurant = (restaurants as any[]).find((restaurant) => restaurant.owner_id === user?.id);
        if (ownedRestaurant) {
          setRestaurantId(ownedRestaurant.id);
        }
      })
      .catch(() => {
        // The submit handler will show a clear error if no restaurant is available.
      });
  }, [user?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!accessToken) {
      setError("Login first to save this item to the backend.");
      return;
    }
    if (!restaurantId) {
      setError("Create or login to your restaurant account first. No owned restaurant was found.");
      return;
    }
    try {
      await restaurantApi.createFoodItem(
        {
          restaurant_id: restaurantId,
          name,
          description: `${category} item`,
          price,
          preparation_time_minutes: Number(prepMinutes),
          is_available: true,
          is_halal: true
        },
        accessToken
      );
      setMessage("Food item sent to backend.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save food item.");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Add Food Item</h1>
          <p>Create menu items with pricing, category, prep time, and availability.</p>
        </div>
      </div>
      <section className="form-panel">
        <form className="form-grid two-col" onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Local Meals</option>
              <option>Seafood</option>
              <option>Drinks</option>
              <option>Snacks</option>
            </select>
          </div>
          <div className="field">
            <label>Price</label>
            <input value={price} onChange={(event) => setPrice(event.target.value)} />
          </div>
          <div className="field">
            <label>Prep minutes</label>
            <input value={prepMinutes} onChange={(event) => setPrepMinutes(event.target.value)} />
          </div>
          {error && <p className="form-error form-span">{error}</p>}
          {message && <p className="form-success form-span">{message}</p>}
          <button className="primary-button form-span">
            <Save size={17} />
            Save Food Item
          </button>
        </form>
      </section>
    </div>
  );
}
