"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div>
      <div className="page-head"><div><h1>Settings</h1><p>Platform operation preferences and admin account controls.</p></div></div>
      <section className="panel">
        <h2>Admin Controls</h2>
        <p className="muted">Production admin controls should include audit logs, permission groups, and incident monitoring.</p>
        <button className="primary-button" onClick={handleLogout}>Logout</button>
      </section>
    </div>
  );
}
