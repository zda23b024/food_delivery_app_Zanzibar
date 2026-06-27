import type { Metadata } from "next";
import { CartProvider } from "@/contexts/CartContext";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZanMeal",
  description: "Zanzibar food delivery for customers, restaurants, and riders."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
