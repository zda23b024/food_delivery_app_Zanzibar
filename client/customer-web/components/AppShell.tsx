"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ListOrdered, MapPin, Menu, Search, Settings, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/restaurants", label: "Restaurants", icon: Search },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/profile", label: "Profile", icon: User }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="ZanMeal home">
          <span className="brand-mark">Z</span>
          <span>
            <strong>ZanMeal</strong>
            <small>Good Food. Fast. Always.</small>
          </span>
        </Link>

        <div className="location-pill">
          <MapPin size={16} />
          <span>Stone Town, Zanzibar</span>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={active ? "nav-item active" : "nav-item"}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link href="/settings" className={pathname === "/settings" ? "nav-item active bottom-link" : "nav-item bottom-link"}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </aside>

      <header className="mobile-header">
        <Link href="/" className="brand compact" aria-label="ZanMeal home">
          <span className="brand-mark">Z</span>
          <strong>ZanMeal</strong>
        </Link>
        <div className="mobile-actions">
          <Link href="/cart" className="icon-button" aria-label="Cart">
            <ShoppingCart size={19} />
            {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </Link>
          <button className="icon-button" aria-label="Menu">
            <Menu size={19} />
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      <Link href="/cart" className="floating-cart" aria-label="Open cart">
        <ShoppingCart size={20} />
        <span>{itemCount}</span>
      </Link>
    </div>
  );
}
