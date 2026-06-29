"use client";

import { Navigation } from "lucide-react";
import { useOrderTracking } from "@/hooks/useOrderTracking";

export function TrackingPanel({ orderId }: { orderId: string }) {
  const { connected, events } = useOrderTracking(orderId);

  return (
    <section className="profile-panel">
      <div className="row between">
        <h2>Live Tracking</h2>
        <span className="status-pill"><Navigation size={13} /> {connected ? "Live" : "Waiting"}</span>
      </div>
      {events.length === 0 ? (
        <p>Real-time rider location and order status updates will appear here.</p>
      ) : (
        <div className="order-list">
          {events.slice(0, 4).map((event, index) => (
            <article className="tracking-event" key={`${event.sent_at}-${index}`}>
              <div className="tag-row">
                <span>{event.type}</span>
                {event.status && <span>{event.status}</span>}
                {event.eta_minutes && <span>{event.eta_minutes} min ETA</span>}
                {event.distance_km && <span>{event.distance_km} km</span>}
              </div>
              {event.latitude !== undefined && event.longitude !== undefined && (
                <small>Rider location: {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</small>
              )}
              {event.message && <p>{event.message}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
