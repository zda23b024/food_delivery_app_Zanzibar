"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Headphones, Heart, Home, ListOrdered, LogIn, LogOut, MapPin, Menu, Search, Settings, ShoppingCart, User, UserPlus, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/restaurants", label: "Restaurants", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/profile", label: "Profile", icon: User }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const router = useRouter();
  const { items } = useCart();
  const { user, loading, logout } = useAuth();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAuthPage = currentPath.startsWith("/login") || currentPath === "/register" || currentPath === "/admin-login" || currentPath === "/admin-credentials";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isAuthPage) {
    return <main className="auth-shell-full">{children}</main>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="Zanmart home">
          <img src="/zanmart-mark.svg" alt="Zanmart Food Delivery" className="brand-logo brand-logo-mark" />
          <span>
            <strong>Zanmart</strong>
            <small>Good Food. Fast Delivery.</small>
          </span>
        </Link>

        <div className="location-pill">
          <User size={28} />
          <span><strong>{user ? user.full_name : "Zakariya Yahya Alijy"}</strong><small>{user?.role || "Customer"}</small></span>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;
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
            <Link href="/login" className={currentPath.startsWith("/login") ? "nav-item active" : "nav-item"}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
            <Link href="/register" className={currentPath === "/register" ? "nav-item active" : "nav-item"}>
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </div>
        )}

        <div className="sidebar-promo">
          <span>Fast delivery at your doorstep</span>
          <p>Live tracking and real-time order updates.</p>
          <div className="promo-art">
            <Zap size={32} />
            <strong>25 min</strong>
          </div>
          <Link href="/orders" className="promo-button">Track Order</Link>
        </div>

        <div className="sidebar-support">
          <Link href="/settings" className={currentPath === "/settings" ? "active" : ""}><Settings size={16} /> Settings</Link>
          <Link href="/support" className={currentPath === "/support" ? "active" : ""}><Headphones size={16} /> Help & Support</Link>
          {user ? (
            <button type="button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
          ) : (
            <Link href="/login"><LogIn size={16} /> Login</Link>
          )}
        </div>
      </aside>

      <header className="mobile-header">
        <Link href="/" className="brand compact" aria-label="Zanmart home">
          <img src="/zanmart-mark.svg" alt="Zanmart Food Delivery" className="brand-logo small brand-logo-mark" />
          <strong>Zanmart</strong>
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
          <button className="icon-button" aria-label="Menu" onClick={() => router.push("/settings")} type="button">
            <Menu size={19} />
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      <Link href="/cart" className="floating-cart" aria-label="Open cart">
        <ShoppingCart size={20} />
        <span>{itemCount}</span>
      </Link>

      <nav className="mobile-tabbar" aria-label="Primary mobile navigation">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;
          return (
            <Link key={item.href} href={item.href} className={active ? "mobile-tab active" : "mobile-tab"}>
              <Icon size={18} />
              <span>{item.label === "Restaurants" ? "Browse" : item.label}</span>
              {item.href === "/cart" && itemCount > 0 && <b>{itemCount}</b>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
