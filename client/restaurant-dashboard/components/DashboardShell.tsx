"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgePercent, BarChart3, ClipboardList, Home, LogIn, LogOut, Settings, Store, Utensils } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/menu", label: "Menu", icon: Utensils },
  { href: "/promotions", label: "Promotions", icon: BadgePercent },
  { href: "/earnings", label: "Earnings", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: Store },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <img src="/zanmart-logo.svg" alt="Zanmart Food Delivery" className="brand-logo" />
          <span>
            <strong>Zanmart</strong>
            <small>Restaurant Dashboard</small>
          </span>
        </Link>

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

        {user ? (
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <Link href="/login" className={pathname === "/login" ? "nav-item active bottom-link" : "nav-item bottom-link"}>
            <LogIn size={18} />
            <span>Login</span>
          </Link>
        )}
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <strong>{user?.full_name || "Restaurant Owner"}</strong>
            <span>{user ? `${user.role} account` : "Login to sync backend data"}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
