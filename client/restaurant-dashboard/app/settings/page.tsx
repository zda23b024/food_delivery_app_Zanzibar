"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Restaurant operations, notifications, language, and account settings.</p>
        </div>
      </div>
      <section className="form-panel">
        <div className="form-grid two-col">
          <div className="field">
            <label>Dashboard language</label>
            <select defaultValue={user?.preferred_language || "en"}>
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="field">
            <label>Order alert channel</label>
            <select defaultValue="push">
              <option value="push">Push notification</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <label className="row form-span">
            <input type="checkbox" defaultChecked />
            Auto-print accepted orders
          </label>
          <label className="row form-span">
            <input type="checkbox" defaultChecked />
            Notify when rider arrives
          </label>
          <button className="primary-button form-span" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}
