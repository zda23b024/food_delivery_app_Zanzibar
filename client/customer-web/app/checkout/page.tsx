"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CartSummary } from "@/components/CartSummary";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { paymentMethods } from "@/data/mock";
import { api } from "@/services/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const { items, clearCart } = useCart();
  const [payment, setPayment] = useState<(typeof paymentMethods)[number]>("M-Pesa");
  const [address, setAddress] = useState("Mkunazini Street, Stone Town, near Darajani Market");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [phoneNumber, setPhoneNumber] = useState("+255700000000");
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function placeOrder() {
    setError("");
    setSuccessOrder("");

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
      const order = await api.createOrder(
        {
          restaurant_id: restaurantIds[0],
          payment_method: payment,
          delivery_type: deliveryType,
          service_type: "food",
          customer_notes: address,
          items: items.map((item) => ({
            food_item_id: item.id,
            quantity: item.quantity
          }))
        },
        accessToken
      ) as { id: string };

      await api.sendPayment(
        {
          order_id: order.id,
          method: payment,
          provider: payment.toLowerCase().replaceAll(" ", "_"),
          phone_number: phoneNumber
        },
        accessToken
      ).catch(() => undefined);

      clearCart();
      setSuccessOrder(order.id);
      router.push("/orders");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not place order. Make sure the backend is running and menu data exists in the database."
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
            <h2>Checkout</h2>
            <p>Confirm your address and mobile money payment method.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Delivery address</label>
            <textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} />
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
            <label>Phone number</label>
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
          <button className="primary-button" onClick={placeOrder} disabled={submitting || items.length === 0}>
            {submitting ? "Placing order..." : user ? "Place Order" : "Login to Checkout"}
          </button>
        </div>
      </section>
      <CartSummary checkout />
    </div>
  );
}
