"use client";

import { useEffect, useState } from "react";
import { api, createOrderTrackingSocket } from "@/services/api";

export type TrackingEvent = {
  order_id: string;
  type: string;
  rider_id?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  eta_minutes?: number;
  distance_km?: number;
  message?: string;
  sent_at?: string;
};

export function useOrderTracking(orderId: string | null) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    api.getTrackingEvents(orderId).then((trackingEvents) => {
      setEvents(
        trackingEvents.map((event) => ({
          order_id: event.order_id,
          type: "tracking_event",
          rider_id: event.rider_id || undefined,
          status: event.status,
          latitude: event.latitude ?? undefined,
          longitude: event.longitude ?? undefined,
          eta_minutes: event.eta_minutes ?? undefined,
          distance_km: event.distance_km ?? undefined,
          message: event.message || undefined,
          sent_at: event.recorded_at || event.created_at
        }))
      );
    }).catch(() => undefined);

    const socket = createOrderTrackingSocket(orderId);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (message) => {
      setEvents((current) => [JSON.parse(message.data) as TrackingEvent, ...current]);
    };

    return () => socket.close();
  }, [orderId]);

  return { connected, events };
}
