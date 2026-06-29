"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Settings</h2>
          <p>Language, notifications, privacy, and payment preferences.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="form-panel">
          <div className="form-grid">
            <div className="field">
              <label>Language</label>
              <select defaultValue={user?.preferred_language || "en"}>
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="field">
              <label>Default payment</label>
              <select defaultValue="mpesa">
                <option value="mpesa">M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="tigo">Tigo Pesa</option>
                <option value="halopesa">HaloPesa</option>
              </select>
            </div>
            <label className="row">
              <input type="checkbox" defaultChecked />
              Order status notifications
            </label>
            <label className="row">
              <input type="checkbox" defaultChecked />
              Promotions and loyalty offers
            </label>
            {user ? (
              <button className="primary-button danger" onClick={handleLogout}>
                <LogOut size={17} />
                Logout
              </button>
            ) : (
              <button className="primary-button" onClick={() => router.push("/login")}>
                Login
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
