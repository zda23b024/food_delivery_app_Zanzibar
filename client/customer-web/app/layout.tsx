import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoriteProvider } from "@/contexts/FavoriteContext";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zanmart",
  description: "Zanzibar food delivery for customers, restaurants, and riders.",
  icons: {
    icon: "/zanmart-mark.svg",
    shortcut: "/zanmart-mark.svg",
    apple: "/zanmart-mark.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <FavoriteProvider>
              <AppShell>{children}</AppShell>
            </FavoriteProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
