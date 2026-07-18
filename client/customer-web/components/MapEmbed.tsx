"use client";

import { ExternalLink, MapPin, Navigation } from "lucide-react";

type MapPoint = {
  latitude?: number | null;
  longitude?: number | null;
  label: string;
};

function hasCoordinates(point?: MapPoint | null): point is Required<Pick<MapPoint, "latitude" | "longitude" | "label">> {
  return typeof point?.latitude === "number" && typeof point.longitude === "number";
}

export function MapEmbed({
  origin,
  destination,
  title = "Delivery map",
  height = 260
}: {
  origin?: MapPoint | null;
  destination?: MapPoint | null;
  title?: string;
  height?: number;
}) {
  const destinationReady = hasCoordinates(destination);
  const originReady = hasCoordinates(origin);
  const target = destinationReady ? destination : originReady ? origin : null;

  if (!target) {
    return (
      <div className="map-embed empty">
        <MapPin size={24} />
        <strong>Location not ready</strong>
        <p>Add latitude and longitude to preview the delivery map.</p>
      </div>
    );
  }

  const mapUrl = originReady && destinationReady
    ? `https://maps.google.com/maps?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&z=14&output=embed`
    : `https://maps.google.com/maps?q=${target.latitude},${target.longitude}&z=15&output=embed`;
  const openUrl = originReady && destinationReady
    ? `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${target.latitude},${target.longitude}`;

  return (
    <div className="map-embed" style={{ minHeight: height }}>
      <div className="map-toolbar">
        <span><Navigation size={14} /> {title}</span>
        <a href={openUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open</a>
      </div>
      <iframe
        title={title}
        src={mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
