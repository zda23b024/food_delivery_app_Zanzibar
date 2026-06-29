export const platformStats = [
  { label: "Orders Today", value: "184", hint: "32 active" },
  { label: "Gross Volume", value: "TZS 8.4M", hint: "15% commission model" },
  { label: "Restaurants", value: "46", hint: "7 pending approval" },
  { label: "Riders Online", value: "28", hint: "Stone Town, Nungwi, Pemba" }
];

export const users = [
  { id: "u1", name: "Amina Ali", role: "customer", phone: "+255700000001", status: "active" },
  { id: "u2", name: "Stone Grill Owner", role: "restaurant", phone: "+255700000002", status: "active" },
  { id: "u3", name: "Hassan Mussa", role: "rider", phone: "+255700000003", status: "online" }
];

export const restaurants = [
  { id: "r1", name: "Stone Grill Zanzibar", area: "Stone Town", status: "approved", rating: "4.8" },
  { id: "r2", name: "Dhow Bites", area: "Nungwi", status: "approved", rating: "4.7" },
  { id: "r3", name: "Pemba Fresh Kitchen", area: "Chake Chake", status: "pending", rating: "New" }
];

export const riders = [
  { id: "rd1", name: "Hassan Mussa", area: "Stone Town", status: "online", deliveries: 312 },
  { id: "rd2", name: "Salma Omar", area: "Nungwi", status: "offline", deliveries: 188 },
  { id: "rd3", name: "Ali Hamad", area: "Pemba", status: "online", deliveries: 95 }
];

export const orders = [
  { id: "ZM-9041AA", customer: "Amina Ali", restaurant: "Stone Grill", status: "preparing", total: "TZS 30,500" },
  { id: "ZM-2218PX", customer: "Juma Said", restaurant: "Spice Street", status: "pending", total: "TZS 18,000" },
  { id: "ZM-7720NY", customer: "Nadia", restaurant: "Dhow Bites", status: "delivered", total: "TZS 42,000" }
];

export const payments = [
  { id: "pay-1", method: "M-Pesa", status: "paid", reference: "MPESA-82F2A", amount: "TZS 30,500" },
  { id: "pay-2", method: "Airtel Money", status: "processing", reference: "AIRTEL-12AC9", amount: "TZS 18,000" },
  { id: "pay-3", method: "HaloPesa", status: "failed", reference: "HALO-98ZX1", amount: "TZS 42,000" }
];

export const reviews = [
  { id: "rev-1", restaurant: "Stone Grill", rating: 5, comment: "Excellent pilau and fast rider." },
  { id: "rev-2", restaurant: "Dhow Bites", rating: 4, comment: "Good seafood platter." }
];
