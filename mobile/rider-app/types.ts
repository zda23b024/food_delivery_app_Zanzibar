export type RiderOrderStatus = "Available" | "Accepted" | "Picked Up" | "Delivered";

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
