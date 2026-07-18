"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, ShoppingBag } from "lucide-react";
import { CartSummary } from "@/components/CartSummary";
import { MapEmbed } from "@/components/MapEmbed";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api, type AddressResponse } from "@/services/api";
import type { Restaurant } from "@/types";
import { mapRestaurant } from "@/utils/backendMappers";
import { getCurrentGpsLocation } from "@/utils/geolocation";

const paymentMethods = ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Cash"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const { items, clearCart } = useCart();
  const [payment, setPayment] = useState<(typeof paymentMethods)[number]>("M-Pesa");
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [addressId, setAddressId] = useState("");
  const [address, setAddress] = useState("Mkunazini Street, Stone Town, near Darajani Market");
  const [area, setArea] = useState("Stone Town");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [eta, setEta] = useState<{ distance_km: number; eta_minutes: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [phoneNumber, setPhoneNumber] = useState("+255700000000");
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedRestaurant = restaurants.find((item) => item.id === items[0]?.restaurantId);
  const customerLatitude = latitude ? Number(latitude) : null;
  const customerLongitude = longitude ? Number(longitude) : null;

  useEffect(() => {
    if (!accessToken) return;
    api.getAddresses(accessToken).then((saved) => {
      setAddresses(saved);
      const defaultAddress = saved.find((item) => item.is_default) || saved[0];
      if (defaultAddress) {
        setAddressId(defaultAddress.id);
        setAddress(defaultAddress.street_address || address);
        setArea(defaultAddress.area || area);
        setLatitude(defaultAddress.latitude?.toString() || "");
        setLongitude(defaultAddress.longitude?.toString() || "");
      } else {
        useCurrentLocation(true);
      }
    }).catch(() => undefined);
  }, [accessToken]);

  useEffect(() => {
    api.getRestaurants().then((data) => setRestaurants((data as any[]).map(mapRestaurant))).catch(() => undefined);
  }, []);

  async function calculateEta() {
    setLocationMessage("");
    setEta(null);
    const restaurantId = items[0]?.restaurantId;
    const restaurant = restaurants.find((item) => item.id === restaurantId);
    if (!restaurant?.latitude || !restaurant?.longitude || !latitude || !longitude) {
      setLocationMessage("Add customer latitude/longitude and make sure the restaurant has coordinates.");
      return;
    }
    try {
      const result = await api.getDistance({
        origin_latitude: restaurant.latitude,
        origin_longitude: restaurant.longitude,
        destination_latitude: Number(latitude),
        destination_longitude: Number(longitude),
        preparation_minutes: 15
      });
      setEta(result);
      setLocationMessage(`Estimated delivery: ${result.eta_minutes} min, ${result.distance_km.toFixed(2)} km.`);
    } catch (err) {
      setLocationMessage(err instanceof Error ? err.message : "Could not calculate delivery ETA.");
    }
  }

  async function useCurrentLocation(silent = false) {
    if (!silent) setLocationMessage("Getting your real GPS location...");
    try {
      const gps = await getCurrentGpsLocation();
      setLatitude(gps.latitude.toString());
      setLongitude(gps.longitude.toString());
      if (gps.address) {
        setAddress(gps.address.formatted_address);
        setArea(gps.address.area);
      }
      setLocationMessage(`GPS location captured${gps.address?.area ? ` near ${gps.address.area}` : ""}. Accuracy about ${Math.round(gps.accuracy)}m.`);
    } catch (err) {
      if (!silent) {
        setLocationMessage(err instanceof Error ? err.message : "Could not access GPS location. Allow location permission.");
      }
    }
  }

  async function placeOrder() {
    setError("");
    setSuccessOrder("");
    setPaymentMessage("");

    if (!user || !accessToken) {
      router.push("/login?next=/checkout");
      return;
    }

    if (items.length === 0) {
      return;
    }

    const restaurantIds = Array.from(new Set(items.map((item) => item.restaurantId)));
    if (restaurantIds.length > 1) {
      setError("Please checkout items from one restaurant at a time.");
      return;
    }

    setSubmitting(true);
    try {
      let deliveryAddressId = addressId;
      if (!deliveryAddressId && address) {
        const savedAddress = await api.createAddress(
          {
            street_address: address,
            area,
            city: "Zanzibar",
            island: "Unguja",
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            is_default: addresses.length === 0
          },
          accessToken
        ) as AddressResponse;
        deliveryAddressId = savedAddress.id;
      }

      const order = await api.createOrder(
        {
          restaurant_id: restaurantIds[0],
          delivery_address_id: deliveryAddressId || undefined,
          payment_method: payment,
          delivery_type: deliveryType,
          service_type: "food",
          customer_notes: `Deliver to ${address}${area ? `, ${area}` : ""}`,
          items: items.map((item) => ({
            food_item_id: item.id,
            quantity: item.quantity
          }))
        },
        accessToken
      ) as { id: string };

      const paymentResponse = await api.sendPayment(
        {
          order_id: order.id,
          method: payment,
          provider: payment === "Cash" ? undefined : payment,
          phone_number: payment === "Cash" ? undefined : phoneNumber
        },
        accessToken
      );

      clearCart();
      setSuccessOrder(order.id);
      setPaymentMessage(paymentResponse.provider_message || `Payment status: ${paymentResponse.status}`);
      router.push("/orders");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
            : "Could not place order or start payment. Make sure the backend is running and menu data exists in the database."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <section className="form-panel">
        <div className="section-head">
          <div>
            <span className="app-pill"><ShoppingBag size={15} /> Checkout</span>
            <h2>Place order</h2>
            <p>Confirm your address, payment method, and delivery type.</p>
          </div>
        </div>
        <div className="form-grid">
          {addresses.length > 0 && (
            <div className="field">
              <label>Saved location</label>
              <select
                value={addressId}
                onChange={(event) => {
                  const selected = addresses.find((item) => item.id === event.target.value);
                  setAddressId(event.target.value);
                  if (selected) {
                    setAddress(selected.street_address || "");
                    setArea(selected.area || "");
                    setLatitude(selected.latitude?.toString() || "");
                    setLongitude(selected.longitude?.toString() || "");
                  }
                }}
              >
                <option value="">Use new address</option>
                {addresses.map((saved) => (
                  <option key={saved.id} value={saved.id}>{saved.street_address || saved.area}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label><MapPin size={14} /> Delivery address</label>
            <textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
          <div className="field">
            <label>Area</label>
            <input value={area} onChange={(event) => setArea(event.target.value)} />
          </div>
          <div className="location-picker">
            <div className="section-head tight">
              <div>
                <h2>Location and ETA</h2>
                <p>The system uses your real GPS location when permission is allowed.</p>
              </div>
            </div>
            <div className="form-grid two-col compact-form">
              <div className="field">
                <label>Latitude</label>
                <input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="-6.162000" />
              </div>
              <div className="field">
                <label>Longitude</label>
                <input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="39.192000" />
              </div>
              <button type="button" className="primary-button secondary" onClick={() => useCurrentLocation()}>
                Use real GPS location
              </button>
              <button type="button" className="primary-button secondary" onClick={calculateEta}>
                Calculate ETA
              </button>
            </div>
            {eta && <p className="form-success">ETA {eta.eta_minutes} min - {eta.distance_km.toFixed(2)} km</p>}
            {locationMessage && !eta && <p className="data-note">{locationMessage}</p>}
            <MapEmbed
              title="Restaurant to delivery location"
              origin={{
                label: selectedRestaurant?.name || "Restaurant",
                latitude: selectedRestaurant?.latitude,
                longitude: selectedRestaurant?.longitude
              }}
              destination={{
                label: address || "Delivery location",
                latitude: Number.isFinite(customerLatitude) ? customerLatitude : null,
                longitude: Number.isFinite(customerLongitude) ? customerLongitude : null
              }}
              height={240}
            />
          </div>
          <div className="field">
            <label>Delivery type</label>
            <select value={deliveryType} onChange={(event) => setDeliveryType(event.target.value)}>
              <option value="standard">Standard delivery</option>
              <option value="hotel">Hotel delivery</option>
              <option value="beach">Beach delivery</option>
            </select>
          </div>
          <div className="field">
            <label><Phone size={14} /> Phone number</label>
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          </div>
          <div className="field">
            <label>Payment method</label>
            <div className="payment-options">
              {paymentMethods.map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    checked={payment === method}
                    onChange={() => setPayment(method)}
                  />{" "}
                  {method}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          {successOrder && <p className="form-success">Order created: {successOrder}</p>}
          {paymentMessage && <p className="form-success">{paymentMessage}</p>}
          <button className="primary-button" onClick={placeOrder} disabled={submitting || items.length === 0}>
            {submitting ? "Placing order..." : user ? "Place Order" : "Login to Checkout"}
          </button>
        </div>
      </section>
      <CartSummary checkout />
    </div>
  );
}
