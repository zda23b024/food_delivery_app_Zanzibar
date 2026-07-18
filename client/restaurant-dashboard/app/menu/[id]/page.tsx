"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";

export default function EditMenuItemPage({ params }: { params: { id: string } }) {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("20");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading item...");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([restaurantApi.getFoodItem(params.id), restaurantApi.getCategories()])
      .then(([item, liveCategories]: any[]) => {
        setName(item.name || "");
        setCategoryId(item.category_id || "");
        setDescription(item.description || "");
        setPrice(String(item.price || ""));
        setPrepMinutes(String(item.preparation_time_minutes || 20));
        setAvailable(Boolean(item.is_available));
        setFeatured(Boolean(item.is_featured));
        setCategories((liveCategories || []).map((category: any) => ({ id: category.id, name: category.name })));
        setMessage("");
      })
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      setError("Login first to update menu items.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await restaurantApi.updateFoodItem(
        params.id,
        {
          name,
          category_id: categoryId || null,
          description,
          price,
          preparation_time_minutes: Number(prepMinutes),
          is_available: available,
          is_featured: featured
        },
        accessToken
      );
      if (image) {
        await restaurantApi.uploadFoodImage(params.id, image, accessToken);
      }
      setMessage(image ? "Menu item and image updated." : "Menu item updated.");
      setImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update item.");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Edit Menu Item</h1>
          <p>Adjust item details, price, availability, and featured status.</p>
        </div>
        <Link href="/menu" className="primary-button secondary">Back to Menu</Link>
      </div>
      <section className="form-panel">
        <form className="form-grid two-col" onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="field">
            <label>Price</label>
            <input value={price} onChange={(event) => setPrice(event.target.value)} required />
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
          <div className="field">
            <label>Prep minutes</label>
            <input value={prepMinutes} onChange={(event) => setPrepMinutes(event.target.value)} />
          </div>
          <div className="field form-span">
            <label>Description</label>
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="field form-span">
            <label>Replace food image</label>
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
            Save Changes
          </button>
        </form>
      </section>
    </div>
  );
}
