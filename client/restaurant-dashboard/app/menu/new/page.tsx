"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import { findOwnedRestaurant } from "@/utils/backend";

export default function NewMenuItemPage() {
  const { accessToken, user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("12000");
  const [prepMinutes, setPrepMinutes] = useState("18");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([restaurantApi.getRestaurants(), restaurantApi.getCategories()])
      .then(([restaurants, liveCategories]) => {
        const ownedRestaurant = findOwnedRestaurant(restaurants as any[], user?.id);
        if (ownedRestaurant) {
          setRestaurantId(ownedRestaurant.id);
        }
        const mappedCategories = (liveCategories as any[]).map((category) => ({ id: category.id, name: category.name }));
        setCategories(mappedCategories);
        setCategoryId(mappedCategories[0]?.id || "");
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
      const created = await restaurantApi.createFoodItem(
        {
          restaurant_id: restaurantId,
          category_id: categoryId || undefined,
          name,
          description: description || "Restaurant menu item",
          price,
          preparation_time_minutes: Number(prepMinutes),
          is_available: available,
          is_featured: featured,
          is_halal: true
        },
        accessToken
      ) as { id: string };
      if (image) {
        await restaurantApi.uploadFoodImage(created.id, image, accessToken);
      }
      setMessage(image ? "Food item and image saved to backend." : "Food item sent to backend.");
      setName("");
      setDescription("");
      setImage(null);
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
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="field form-span">
            <label>Description</label>
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="field">
            <label>Price</label>
            <input value={price} onChange={(event) => setPrice(event.target.value)} />
          </div>
          <div className="field">
            <label>Prep minutes</label>
            <input value={prepMinutes} onChange={(event) => setPrepMinutes(event.target.value)} />
          </div>
          <div className="field form-span">
            <label>Food image</label>
            <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
          </div>
          <label className="row form-span">
            <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
            Available for ordering
          </label>
          <label className="row form-span">
            <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
            Featured item
          </label>
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
