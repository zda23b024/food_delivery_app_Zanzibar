"use client";

import { useEffect, useState } from "react";
import { createOrderTrackingSocket } from "@/services/api";

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
