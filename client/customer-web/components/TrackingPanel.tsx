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
            <div className="tag-row" key={`${event.sent_at}-${index}`}>
              <span>{event.type}</span>
              {event.status && <span>{event.status}</span>}
              {event.eta_minutes && <span>{event.eta_minutes} min ETA</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
