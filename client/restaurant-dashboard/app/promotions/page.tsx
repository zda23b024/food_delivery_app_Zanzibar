"use client";

import { FormEvent, useEffect, useState } from "react";
import { BadgePercent, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import { findOwnedRestaurant } from "@/utils/backend";

type PromotionRow = {
  id: string;
  title: string;
  promotion_type: string;
  discount_value?: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  restaurant_id?: string | null;
};

export default function PromotionsPage() {
  const { accessToken, user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  const [title, setTitle] = useState("");
  const [promotionType, setPromotionType] = useState("discount");
  const [discountValue, setDiscountValue] = useState("10");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [message, setMessage] = useState("Loading live promotions...");
  const [error, setError] = useState("");

  async function loadPromotions(ownerId?: string | null) {
    const [restaurants, livePromotions] = await Promise.all([restaurantApi.getRestaurants(), restaurantApi.getPromotions()]);
    const owned = findOwnedRestaurant(restaurants as any[], ownerId);
    setRestaurantId(owned?.id || "");
    const restaurantPromotions = (livePromotions as PromotionRow[]).filter((promotion) => !owned || promotion.restaurant_id === owned.id);
    setPromotions(restaurantPromotions);
    setMessage(owned ? (restaurantPromotions.length ? "" : "No live promotions yet.") : "No restaurant profile is linked to this account yet.");
  }

  useEffect(() => {
    loadPromotions(user?.id).catch((err: Error) => setError(err.message));
  }, [user?.id]);

  async function createPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !restaurantId) {
      setError("Login first and make sure this account owns a restaurant.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await restaurantApi.createPromotion(
        {
          restaurant_id: restaurantId,
          title,
          promotion_type: promotionType,
          discount_value: discountValue,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString()
        },
        accessToken
      );
      setTitle("");
      setMessage("Promotion created.");
      await loadPromotions(user?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create promotion.");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Promotions</h1>
          <p>Manage discounts, sponsored visibility, and tourist/hotel delivery campaigns.</p>
        </div>
      </div>

      <section className="form-panel">
        <form className="form-grid two-col" onSubmit={createPromotion}>
          <div className="field">
            <label>Promotion title</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Lunch special" required />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={promotionType} onChange={(event) => setPromotionType(event.target.value)}>
              <option value="discount">Discount</option>
              <option value="featured">Featured visibility</option>
              <option value="tourist">Tourist campaign</option>
            </select>
          </div>
          <div className="field">
            <label>Discount value</label>
            <input value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} />
          </div>
          <div className="field">
            <label>Starts</label>
            <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          </div>
          <div className="field">
            <label>Ends</label>
            <input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          </div>
          <button className="primary-button form-span">
            <Plus size={17} />
            New Promotion
          </button>
        </form>
      </section>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}
      <div className="profile-grid">
        {promotions.map((promotion) => (
          <section className="panel" key={promotion.id}>
            <div className="row between">
              <BadgePercent size={22} color="#d95700" />
              <span className={promotion.is_active ? "tag green" : "tag"}>{promotion.is_active ? "active" : "inactive"}</span>
            </div>
            <h2>{promotion.title}</h2>
            <p className="muted">{promotion.promotion_type} - {promotion.discount_value || "0"}</p>
            <strong>{new Date(promotion.starts_at).toLocaleDateString()} - {new Date(promotion.ends_at).toLocaleDateString()}</strong>
          </section>
        ))}
      </div>
    </div>
  );
}
