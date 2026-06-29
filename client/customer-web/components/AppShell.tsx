"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ListOrdered, LogIn, MapPin, Menu, Search, Settings, ShoppingCart, User, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, loading } = useAuth();
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
          <span>{user ? `${user.full_name}` : "Stone Town, Zanzibar"}</span>
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

        {!loading && !user && (
          <div className="auth-nav">
            <Link href="/login" className={pathname === "/login" ? "nav-item active" : "nav-item"}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
            <Link href="/register" className={pathname === "/register" ? "nav-item active" : "nav-item"}>
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </div>
        )}

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
          {!user && (
            <Link href="/login" className="icon-button" aria-label="Login">
              <LogIn size={19} />
            </Link>
          )}
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
