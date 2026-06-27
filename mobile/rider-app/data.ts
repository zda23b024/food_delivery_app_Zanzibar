import type { RiderOrder } from "./types";

export const availableOrders: RiderOrder[] = [
  {
    id: "ZM-9041AA",
    restaurant: "Stone Grill Zanzibar",
    customer: "Amina Ali",
    pickup: "Mkunazini, Stone Town",
    dropoff: "Forodhani Hotel",
    distanceKm: 3.4,
    payout: 5200,
    status: "Available",
    items: 2
  },
  {
    id: "ZM-2218PX",
    restaurant: "Spice Street Cafe",
    customer: "Juma Said",
    pickup: "Kijangwani",
    dropoff: "SUZA Campus",
    distanceKm: 5.1,
    payout: 6800,
    status: "Available",
    items: 3
  }
];

export const acceptedOrders: RiderOrder[] = [
  {
    id: "ZM-7720NY",
    restaurant: "Dhow Bites",
    customer: "Nadia",
    pickup: "Nungwi Beach",
    dropoff: "Kendwa Rocks",
    distanceKm: 4.7,
    payout: 7500,
    status: "Accepted",
    items: 1
  }
];

export function formatMoney(value: number) {
  return `TZS ${value.toLocaleString("en-TZ")}`;
}
