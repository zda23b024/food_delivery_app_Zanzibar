export type RiderOrderStatus = "Available" | "Accepted" | "Preparing" | "Ready" | "Picked Up" | "Delivered" | "Cancelled";

export type RiderOrder = {
  id: string;
  restaurant: string;
  customer: string;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  payout: number;
  status: RiderOrderStatus;
  items: number;
};
