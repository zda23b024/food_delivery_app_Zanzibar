"use client";

import { MapPin, Phone, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="profile-panel">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="auth-page inline">
        <section className="auth-panel">
          <h1>Login Required</h1>
          <p>Login or create an account to manage your ZanMeal profile, addresses, favorites, and orders.</p>
          <div className="row">
            <Link href="/login?next=/profile" className="primary-button">Login</Link>
            <Link href="/register" className="primary-button secondary">Register</Link>
          </div>
        </section>
      </div>
    );
  }

  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Profile</h2>
          <p>Manage your account, addresses, loyalty, and delivery preferences.</p>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-panel">
          <div className="row between">
            <div>
              <h2>{user.full_name}</h2>
              <p>{user.role} - {user.preferred_language.toUpperCase()}</p>
            </div>
            <span className="brand-mark">{initials}</span>
          </div>
          <div className="tag-row">
            <span><Phone size={13} /> {user.phone_number}</span>
            <span><ShieldCheck size={13} /> {user.is_phone_verified ? "Verified" : "Not verified"}</span>
            <span><Star size={13} /> 1,240 points</span>
          </div>
        </section>
        <section className="profile-panel">
          <h2>Saved Addresses</h2>
          <p><MapPin size={14} /> Mkunazini Street, Stone Town, Zanzibar</p>
          <p><MapPin size={14} /> Nungwi Beach Hotel, North Unguja</p>
        </section>
      </div>
    </div>
  );
}
