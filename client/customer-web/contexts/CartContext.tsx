"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, FoodItem } from "@/types";
import { restaurants } from "@/data/mock";

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (item: FoodItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("zanmeal-cart");
    if (stored) {
      setItems(JSON.parse(stored) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zanmeal-cart", JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 2500 : 0;
  const total = subtotal + deliveryFee;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      subtotal,
      deliveryFee,
      total,
      addItem(item) {
        const restaurantName = restaurants.find((restaurant) => restaurant.id === item.restaurantId)?.name || "Restaurant";
        setItems((current) => {
          const existing = current.find((cartItem) => cartItem.id === item.id);
          if (existing) {
            return current.map((cartItem) =>
              cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            );
          }
          return [...current, { ...item, restaurantName, quantity: 1 }];
        });
      },
      removeItem(id) {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      updateQuantity(id, quantity) {
        if (quantity <= 0) {
          setItems((current) => current.filter((item) => item.id !== id));
          return;
        }
        setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)));
      },
      clearCart() {
        setItems([]);
      }
    }),
    [items, subtotal, deliveryFee, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
