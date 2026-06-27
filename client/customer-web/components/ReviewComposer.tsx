"use client";

import { ImagePlus, Star } from "lucide-react";

export function ReviewComposer() {
  return (
    <section className="form-panel">
      <div className="section-head">
        <div>
          <h2>Rate Your Order</h2>
          <p>Food quality, delivery speed, rider professionalism, and comments.</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="tag-row">
          <span><Star size={13} fill="currentColor" /> Food quality</span>
          <span><Star size={13} fill="currentColor" /> Delivery speed</span>
          <span><Star size={13} fill="currentColor" /> Rider professionalism</span>
        </div>
        <div className="field">
          <label>Comment</label>
          <textarea rows={3} placeholder="How was the meal and delivery?" />
        </div>
        <label className="primary-button">
          <ImagePlus size={17} />
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden />
          Upload review image
        </label>
      </div>
    </section>
  );
}
