"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { LiveTable } from "@/components/LiveTable";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";

type ReviewRow = {
  id: string;
  restaurant: string;
  food: number;
  delivery: number;
  rider: number;
  comment: string;
};

export default function ReviewsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [message, setMessage] = useState("Login as admin to load reviews.");

  async function load() {
    if (!token) return;
    setMessage("Loading reviews...");
    try {
      const liveReviews = await adminApi.reviews(token);
      setRows((liveReviews as any[]).map((review) => ({
        id: review.id,
        restaurant: review.restaurant?.name || review.restaurant_id?.slice(0, 8) || "Restaurant",
        food: review.food_rating || review.overall_rating || 0,
        delivery: review.delivery_speed_rating || 0,
        rider: review.rider_professionalism_rating || 0,
        comment: review.comment || "-"
      })));
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load reviews.");
    }
  }

  async function remove(reviewId: string) {
    if (!token) return setMessage("Login as admin to delete reviews.");
    setMessage("Deleting review...");
    try {
      await adminApi.deleteReview(reviewId, token);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not delete review.");
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="page-head">
        <div><h1>Reviews</h1><p>Food quality, delivery speed, rider professionalism, and customer comments.</p></div>
        <button className="primary-button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>
      {message && <p className="muted">{message}</p>}
      <LiveTable columns={[
        { key: "restaurant", label: "Restaurant" },
        { key: "food", label: "Food" },
        { key: "delivery", label: "Delivery" },
        { key: "rider", label: "Rider" },
        { key: "comment", label: "Comment" }
      ]} rows={rows} actions={(row) => (
        <button className="mini-button danger" onClick={() => remove(row.id)}><Trash2 size={14} /> Delete</button>
      )} />
    </div>
  );
}
