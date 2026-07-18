"use client";

import { MapPin, Navigation, Truck } from "lucide-react";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { MapEmbed } from "@/components/MapEmbed";

export function TrackingPanel({ orderId }: { orderId: string }) {
  const { connected, events } = useOrderTracking(orderId);
  const latestLocation = events.find((event) => event.latitude !== undefined && event.longitude !== undefined);

  return (
    <section className="profile-panel">
      <div className="row between">
        <h2>Rider Tracking</h2>
        <span className="status-pill"><Navigation size={13} /> {connected ? "Live" : "Waiting"}</span>
      </div>
      {events.length === 0 ? (
        <p>Rider location, ETA, and order status updates will appear here after a rider is assigned.</p>
      ) : (
        <div className="order-list">
          <MapEmbed
            title="Latest rider location"
            destination={{
              label: "Rider",
              latitude: latestLocation?.latitude,
              longitude: latestLocation?.longitude
            }}
            height={220}
          />
          {events.slice(0, 4).map((event, index) => (
            <article className="tracking-event" key={`${event.sent_at}-${index}`}>
              <div className="tag-row">
                <span><Truck size={13} /> {event.type}</span>
                {event.status && <span>{event.status}</span>}
                {event.eta_minutes && <span>{event.eta_minutes} min ETA</span>}
                {event.distance_km && <span>{event.distance_km} km</span>}
              </div>
              {event.latitude !== undefined && event.longitude !== undefined && (
                <small><MapPin size={13} /> Rider location: {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</small>
              )}
              {event.message && <p>{event.message}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
