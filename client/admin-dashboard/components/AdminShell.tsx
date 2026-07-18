"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bike, ClipboardList, CreditCard, Home, LogIn, LogOut, MessageSquare, Settings, Store, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/users", label: "Users", icon: Users },
  { href: "/restaurants", label: "Restaurants", icon: Store },
  { href: "/riders", label: "Riders", icon: Bike },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/content", label: "Content", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <img src="/zanmart-logo.svg" alt="Zanmart Food Delivery" className="brand-logo" />
          <span>
            <strong>Zanmart</strong>
            <small>Admin Dashboard</small>
          </span>
        </Link>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "nav-item active" : "nav-item"}>
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
          <Link href="/login" className="nav-item logout">
            <LogIn size={18} />
            <span>Login</span>
          </Link>
        )}
      </aside>
      <main className="content">
        <header className="topbar">
          <strong>{user?.full_name || "Platform Admin"}</strong>
          <span>{user ? user.role : "Login for live admin API access"}</span>
        </header>
        {children}
      </main>
    </div>
  );
}
