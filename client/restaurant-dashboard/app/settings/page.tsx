"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LogOut, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import { findOwnedRestaurant } from "@/utils/backend";

export default function SettingsPage() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [acceptsCash, setAcceptsCash] = useState(true);
  const [acceptsMobileMoney, setAcceptsMobileMoney] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    restaurantApi.getRestaurants().then((restaurants) => {
      const owned = findOwnedRestaurant(restaurants as any[], user?.id);
      if (!owned) return;
      setRestaurantId(owned.id);
      setMinOrder(String(owned.min_order_amount || 0));
      setDeliveryFee(String(owned.delivery_fee || 0));
      setAcceptsCash(Boolean(owned.accepts_cash));
      setAcceptsMobileMoney(Boolean(owned.accepts_mobile_money));
    }).catch(() => undefined);
  }, [user?.id]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !restaurantId) {
      setError("Login first and make sure this account owns a restaurant.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await restaurantApi.updateRestaurant(
        restaurantId,
        {
          min_order_amount: minOrder,
          delivery_fee: deliveryFee,
          accepts_cash: acceptsCash,
          accepts_mobile_money: acceptsMobileMoney
        },
        accessToken
      );
      setMessage("Restaurant settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Restaurant operations, payments, language, and account settings.</p>
        </div>
      </div>
      <section className="form-panel">
        <form className="form-grid two-col" onSubmit={saveSettings}>
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
          <div className="field">
            <label>Minimum order amount</label>
            <input value={minOrder} onChange={(event) => setMinOrder(event.target.value)} />
          </div>
          <div className="field">
            <label>Delivery fee</label>
            <input value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} />
          </div>
          <label className="row form-span">
            <input type="checkbox" checked={acceptsCash} onChange={(event) => setAcceptsCash(event.target.checked)} />
            Accept cash payments
          </label>
          <label className="row form-span">
            <input type="checkbox" checked={acceptsMobileMoney} onChange={(event) => setAcceptsMobileMoney(event.target.checked)} />
            Accept mobile money payments
          </label>
          {error && <p className="form-error form-span">{error}</p>}
          {message && <p className="form-success form-span">{message}</p>}
          <button className="primary-button form-span">
            <Save size={17} />
            Save Settings
          </button>
          <button type="button" className="primary-button danger form-span" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </form>
      </section>
    </div>
  );
}
