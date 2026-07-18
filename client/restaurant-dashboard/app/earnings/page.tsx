"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, DollarSign, ReceiptText } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import { findOwnedRestaurant, mapOrder } from "@/utils/backend";
import { formatMoney } from "@/utils/money";

export default function EarningsPage() {
  const { accessToken, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [commissionRate, setCommissionRate] = useState(15);
  const [acceptsMobileMoney, setAcceptsMobileMoney] = useState(false);
  const [message, setMessage] = useState("Login as a restaurant owner to load live earnings.");

  useEffect(() => {
    if (!accessToken || !user?.id) return;
    setMessage("Loading live earnings...");
    Promise.all([restaurantApi.getOrders(accessToken), restaurantApi.getRestaurants()])
      .then(([liveOrders, restaurants]) => {
        const owned = findOwnedRestaurant(restaurants as any[], user.id);
        setOrders((liveOrders as any[]).map(mapOrder));
        setCommissionRate(Number(owned?.commission_rate || 15));
        setAcceptsMobileMoney(Boolean(owned?.accepts_mobile_money));
        setMessage("");
      })
      .catch((error: Error) => setMessage(error.message));
  }, [accessToken, user?.id]);

  const gross = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const commission = gross * (commissionRate / 100);
  const payout = gross - commission;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Earnings</h1>
          <p>Track live revenue, commissions, and expected restaurant payout.</p>
        </div>
      </div>
      {message && <p className="muted">{message}</p>}
      <div className="stats-grid">
        <StatCard label="Gross Sales" value={formatMoney(gross)} hint="From live backend orders" icon={DollarSign} />
        <StatCard label="Commission" value={formatMoney(commission)} hint={`${commissionRate}% restaurant commission`} icon={ReceiptText} />
        <StatCard label="Payout" value={formatMoney(payout)} hint="Estimated transfer" icon={Banknote} />
        <StatCard label="Payments" value={acceptsMobileMoney ? "Mobile Money" : "Cash"} hint="Based on restaurant settings" icon={CreditCard} />
      </div>
      <section className="panel">
        <h2>Recent Paid Orders</h2>
        {orders.length === 0 ? (
          <p className="muted">No live restaurant orders yet.</p>
        ) : orders.slice(0, 6).map((order) => (
          <div className="row between" key={order.id}>
            <span>{order.orderNumber} - {order.status.replaceAll("_", " ")}</span>
            <strong>{formatMoney(order.total)}</strong>
          </div>
        ))}
      </section>
    </div>
  );
}
