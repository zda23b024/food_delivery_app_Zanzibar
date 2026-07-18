"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, Clock, Filter, HeartHandshake, LayoutGrid, MapPin, MoreVertical, Phone, RefreshCw, Search, Star, Truck, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type OrderResponse } from "@/services/api";
import { formatMoney } from "@/utils/money";

const statusSteps = [
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "on_the_way", label: "On the way" },
  { key: "delivered", label: "Delivered" }
];

function statusLabel(status: string) {
  if (status === "ready_for_pickup") return "Ready";
  if (status === "picked_up" || status === "on_the_way") return "On the way";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function currentStepIndex(status: string) {
  if (status === "pending") return 0;
  if (status === "picked_up" || status === "on_the_way") return 2;
  const index = statusSteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}

function foodImage(index: number) {
  const images = [
    "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80"
  ];
  return images[index % images.length];
}

export default function OrdersPage() {
  const { user, accessToken, loading } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [error, setError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadOrders = useCallback(() => {
    if (!accessToken) return;
    setError("");
    setLoadingOrders(true);
    api
      .getOrders(accessToken)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders"))
      .finally(() => setLoadingOrders(false));
  }, [accessToken]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const activeOrder = useMemo(
    () => orders.find((order) => !["delivered", "cancelled"].includes(order.status.toLowerCase())),
    [orders]
  );
  const pastOrders = orders.filter((order) => ["delivered", "cancelled"].includes(order.status.toLowerCase()));

  if (loading) {
    return <div className="profile-panel">Loading orders...</div>;
  }

  if (!user) {
    return (
      <div className="auth-page inline">
        <section className="auth-panel">
          <h1>Login Required</h1>
          <p>Login to view orders and receive real-time rider updates.</p>
          <Link href="/login?next=/orders" className="primary-button">Login</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="home-topbar orders-topbar">
        <span><MapPin size={15} /> Stone Town, Zanzibar</span>
        <div className="home-top-actions">
          <Link href="/support" className="top-action-button"><Bell size={17} /><b>3</b></Link>
          <Link href="/cart" className="top-action-button"><Truck size={17} /><b>{orders.length}</b></Link>
          <Link href="/profile" className="home-user-chip">{user.full_name.split(" ")[0]} <small>Customer</small></Link>
        </div>
      </header>

      <section className="orders-head">
        <div>
          <h1>Orders</h1>
          <p>Track active orders and review past deliveries.</p>
        </div>
        <div className="orders-bag-hero">
          <img src="/zanmart-mark.svg" alt="Zanmart delivery bag" />
        </div>
      </section>

      <section className="orders-toolbar">
        <label>
          <Search size={16} />
          <input placeholder="Search by order ID, restaurant or food..." />
        </label>
        <button type="button" onClick={loadOrders}><CalendarDays size={16} /> All Time</button>
        <button type="button" onClick={loadOrders}><Filter size={16} /> Filter</button>
        <button type="button" className="refresh" onClick={loadOrders} disabled={loadingOrders}>
          <RefreshCw size={16} /> Refresh
        </button>
      </section>

      <div className="orders-tabs">
        <span className="active">Active Orders ({activeOrder ? 1 : 0})</span>
        <span>Past Orders ({pastOrders.length})</span>
        <span>Cancelled Orders ({orders.filter((order) => order.status.toLowerCase() === "cancelled").length})</span>
      </div>

      {error && <p className="form-error">{error}</p>}

      {activeOrder ? (
        <ActiveOrderCard order={activeOrder} />
      ) : (
        <section className="orders-empty-card">
          <strong>No active order right now</strong>
          <p>Place an order and live delivery progress will appear here.</p>
          <Link href="/restaurants">Browse restaurants</Link>
        </section>
      )}

      <section className="past-orders-section">
        <h2>Past Orders</h2>
        <div className="past-orders-list">
          {(pastOrders.length ? pastOrders : orders).map((order, index) => (
            <PastOrderRow key={order.id} order={order} index={index} />
          ))}
          {orders.length === 0 && !loadingOrders && (
            <div className="orders-empty-row">
              <strong>No orders yet</strong>
              <span>Your delivered and cancelled orders will appear here.</span>
            </div>
          )}
        </div>
      </section>

      <section className="orders-help-strip">
        <div>
          <h3>Need help with your order?</h3>
          <p>We&apos;re here to help you anytime.</p>
        </div>
        <span><HeartHandshake size={22} /><strong>Live Chat</strong><small>Chat with us</small></span>
        <span><Phone size={22} /><strong>Call Us</strong><small>+255 765 000 123</small></span>
        <span><CheckCircle2 size={22} /><strong>Help Center</strong><small>Find answers</small></span>
      </section>
    </div>
  );
}

function ActiveOrderCard({ order }: { order: OrderResponse }) {
  const normalizedStatus = order.status.toLowerCase();
  const stepIndex = currentStepIndex(normalizedStatus);
  const items = order.items.map((item) => `${item.quantity}x ${item.item_name}`).join(", ");

  return (
    <article className="active-order-card">
      <div className="active-order-image">
        <img src={foodImage(0)} alt={items || "Active order"} />
        <span>LIVE</span>
      </div>
      <div className="active-order-main">
        <small>Order</small>
        <h2>#{order.order_number}</h2>
        <p>from <strong>{order.items[0]?.item_name || "Restaurant"}</strong></p>
        <span>{items || "Food order"}</span>
        <div className="active-order-meta">
          <span><Star size={13} fill="currentColor" /> 4.7 (210+)</span>
          <Link href="/support">Rate Order</Link>
        </div>
        <div className="active-order-stats">
          <span><Clock size={15} /> 20-25 min <small>Estimated Delivery</small></span>
          <span><Truck size={15} /> {statusLabel(normalizedStatus)} <small>Your rider is on the way</small></span>
          <span><MapPin size={15} /> 1.2 km away <small>from your location</small></span>
        </div>
      </div>
      <div className="active-order-status">
        <h3>Order Status</h3>
        <div className="order-progress-line">
          {statusSteps.map((step, index) => (
            <span key={step.key} className={index <= stepIndex ? "active" : ""}>
              <i />
              {step.label}
            </span>
          ))}
        </div>
        <div className="rider-mini-card">
          <div><strong>Ali Juma</strong><small>Rider is on the way</small></div>
          <b>4.8 ★</b>
          <a href="tel:+255765000123"><Phone size={15} /></a>
        </div>
        <Link href="/orders" className="track-order-button"><MapPin size={16} /> Track Order</Link>
      </div>
    </article>
  );
}

function PastOrderRow({ order, index }: { order: OrderResponse; index: number }) {
  const normalizedStatus = order.status.toLowerCase();
  const delivered = normalizedStatus === "delivered";

  return (
    <article className="past-order-row">
      <img src={foodImage(index + 1)} alt={order.items[0]?.item_name || "Order"} />
      <div>
        <strong>Order #{order.order_number}</strong>
        <span>{order.items[0]?.item_name || "Restaurant"}</span>
        <small>{order.items.map((item) => item.item_name).slice(0, 2).join(", ")}</small>
      </div>
      <time>{new Date(order.created_at).toLocaleDateString()}<small>{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></time>
      <strong>{formatMoney(Number(order.total_amount))}<small>{order.items.length} items</small></strong>
      <span className="row-stars">4.{index + 3} ★★★★★</span>
      <span className={delivered ? "order-row-status delivered" : "order-row-status cancelled"}>{delivered ? "Delivered" : statusLabel(normalizedStatus)}</span>
      <Link href="/orders">View Details</Link>
      <MoreVertical size={17} />
    </article>
  );
}
