"use client";

import { RemoteTable } from "@/components/RemoteTable";
import { reviews } from "@/data/mock";
import { adminApi } from "@/services/api";

export default function ReviewsPage() {
  return (
    <div>
      <div className="page-head"><div><h1>Reviews</h1><p>Food quality, delivery speed, rider professionalism, and customer comments.</p></div></div>
      <RemoteTable
        columns={[
        { key: "restaurant", label: "Restaurant" },
        { key: "rating", label: "Rating" },
        { key: "comment", label: "Comment" }
        ]}
        fallbackRows={reviews}
        loadRows={async (token) => {
          const liveReviews = await adminApi.reviews(token || "");
          return (liveReviews as any[]).map((review) => ({
            id: review.id,
            restaurant: review.restaurant_id?.slice(0, 8) || "Restaurant",
            rating: review.food_rating || review.overall_rating || 0,
            comment: review.comment || "-"
          }));
        }}
      />
    </div>
  );
}
