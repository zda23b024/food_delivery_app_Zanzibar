"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/utils/money";

export function CartSummary({ checkout = false }: { checkout?: boolean }) {
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();

  return (
    <section className="cart-panel">
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <div className="empty-state">
          <strong>Your cart is empty</strong>
          <p>Choose a meal from restaurants around Zanzibar.</p>
          <Link href="/restaurants" className="primary-button">Browse Restaurants</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-line" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <strong>{item.name}</strong>
                  <span>{item.restaurantName}</span>
                  <small>{formatMoney(item.price)}</small>
                </div>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
                <button className="icon-button small" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="totals">
            <span>Subtotal <strong>{formatMoney(subtotal)}</strong></span>
            <span>Delivery <strong>{formatMoney(deliveryFee)}</strong></span>
            <span className="total">Total <strong>{formatMoney(total)}</strong></span>
          </div>
          {!checkout && <Link href="/checkout" className="primary-button full">Checkout</Link>}
        </>
      )}
    </section>
  );
}
