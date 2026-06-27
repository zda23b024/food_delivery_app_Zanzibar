"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CartSummary } from "@/components/CartSummary";
import { useCart } from "@/contexts/CartContext";
import { paymentMethods } from "@/data/mock";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [payment, setPayment] = useState<(typeof paymentMethods)[number]>("M-Pesa");

  function placeOrder() {
    if (items.length === 0) {
      return;
    }
    clearCart();
    router.push("/orders");
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
            <textarea rows={3} defaultValue="Mkunazini Street, Stone Town, near Darajani Market" />
          </div>
          <div className="field">
            <label>Delivery type</label>
            <select defaultValue="standard">
              <option value="standard">Standard delivery</option>
              <option value="hotel">Hotel delivery</option>
              <option value="beach">Beach delivery</option>
            </select>
          </div>
          <div className="field">
            <label>Phone number</label>
            <input defaultValue="+255 700 000 000" />
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
          <button className="primary-button" onClick={placeOrder}>Place Order</button>
        </div>
      </section>
      <CartSummary checkout />
    </div>
  );
}
