"use client";

import { Bell, CalendarDays, CreditCard, Edit3, Heart, Home, LockKeyhole, MapPin, MoreVertical, Package, Phone, Plus, ReceiptText, ShieldCheck, Star, User, Utensils } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type AddressResponse } from "@/services/api";
import { getCurrentGpsLocation } from "@/utils/geolocation";

type DisplayAddress = AddressResponse & { label?: string; contact_phone?: string | null };

export default function ProfilePage() {
  const { user, loading, accessToken } = useAuth();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [addressError, setAddressError] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    api
      .getAddresses(accessToken)
      .then(setAddresses)
      .catch((err) => setAddressError(err instanceof Error ? err.message : "Unable to load saved addresses"));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || addresses.length > 0 || latitude || longitude) return;
    useCurrentLocation(true);
  }, [accessToken, addresses.length, latitude, longitude]);

  async function useCurrentLocation(silent = false) {
    if (!silent) setLocationMessage("Getting your real GPS location...");
    try {
      const gps = await getCurrentGpsLocation();
      setLatitude(gps.latitude.toString());
      setLongitude(gps.longitude.toString());
      if (gps.address) {
        setStreetAddress(gps.address.formatted_address);
        setArea(gps.address.area);
      }
      setLocationMessage(`GPS location captured${gps.address?.area ? ` near ${gps.address.area}` : ""}. Accuracy about ${Math.round(gps.accuracy)}m.`);
    } catch (err) {
      if (!silent) {
        setLocationMessage(err instanceof Error ? err.message : "Could not access GPS location. Allow location permission.");
      }
    }
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setSavingAddress(true);
    setAddressError("");
    try {
      await api.createAddress(
        {
          street_address: streetAddress,
          area,
          city: "Zanzibar",
          island: "Unguja",
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          is_default: addresses.length === 0
        },
        accessToken
      );
      const nextAddresses = await api.getAddresses(accessToken);
      setAddresses(nextAddresses);
      setStreetAddress("");
      setArea("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setSavingAddress(false);
    }
  }

  if (loading) {
    return <div className="profile-panel">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="auth-page inline">
        <section className="auth-panel">
          <h1>Login Required</h1>
          <p>Login or create an account to manage your Zanmart profile, addresses, favorites, and orders.</p>
          <div className="row">
            <Link href="/login?next=/profile" className="primary-button">Login</Link>
            <Link href="/register" className="primary-button secondary">Register</Link>
          </div>
        </section>
      </div>
    );
  }

  const addressCards: DisplayAddress[] = addresses.length ? addresses : [
    {
      id: "demo-home",
      label: "Home",
      street_address: "Vuga, Near Forodhani Gardens",
      area: "Stone Town",
      city: "Zanzibar",
      island: "Unguja",
      contact_phone: user.phone_number,
      is_default: true,
      user_id: user.id,
      created_at: user.created_at
    },
    {
      id: "demo-work",
      label: "Work",
      street_address: "Zanmart Office, Malindi Road",
      area: "Malindi",
      city: "Zanzibar",
      island: "Unguja",
      contact_phone: user.phone_number,
      is_default: false,
      user_id: user.id,
      created_at: user.created_at
    },
    {
      id: "demo-other",
      label: "Other",
      street_address: "Mlandege / Darajani area",
      area: "Mlandege",
      city: "Zanzibar",
      island: "Unguja",
      contact_phone: user.phone_number,
      is_default: false,
      user_id: user.id,
      created_at: user.created_at
    }
  ];

  return (
    <div className="profile-dashboard-page">
      <header className="home-topbar profile-topbar">
        <span><MapPin size={15} /> Stone Town, Zanzibar</span>
        <div className="home-top-actions">
          <Link href="/support" className="top-action-button"><Bell size={17} /><b>3</b></Link>
          <Link href="/orders" className="top-action-button"><Package size={17} /><b>0</b></Link>
          <Link href="/profile" className="home-user-chip"><User size={17} /> {user.full_name.split(" ")[0]} <small>Customer</small></Link>
        </div>
      </header>

      <section className="profile-hero">
        <div>
          <p>Welcome back, {user.full_name.split(" ")[0]}!</p>
          <h1>Account and locations</h1>
          <span>Manage your personal details, addresses, and delivery preferences.</span>
        </div>
        <div className="profile-hero-art"><MapPin size={52} /></div>
      </section>

      <section className="profile-summary-card">
        <div className="profile-avatar"><User size={42} /></div>
        <div className="profile-summary-main">
          <div>
            <h2>{user.full_name}</h2>
            <Link href="/settings" className="mini-action-link"><Edit3 size={14} /> Edit</Link>
          </div>
          <p>{user.email || "No email added"}</p>
          <p><Phone size={13} /> {user.phone_number}</p>
        </div>
        <div className="profile-summary-stat"><CalendarDays size={19} /><span>Member since<strong>{new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</strong></span></div>
        <div className="profile-summary-stat"><ReceiptText size={19} /><span>Total Orders<strong>18</strong></span></div>
        <div className="profile-summary-stat"><Utensils size={19} /><span>Favorite Cuisines<strong>Seafood, Pizza, Burgers</strong></span></div>
      </section>

      <section className="profile-block">
        <div className="profile-block-head">
          <h2>Saved addresses</h2>
          <button type="button" onClick={() => useCurrentLocation()}><Plus size={14} /> Add New Address</button>
        </div>
        <div className="saved-address-grid">
          {addressCards.slice(0, 3).map((address, index) => (
            <article className={address.is_default ? "saved-address-card active" : "saved-address-card"} key={address.id}>
              <div>
                {index === 0 ? <Home size={18} /> : <MapPin size={18} />}
                <strong>{address.label || (index === 1 ? "Work" : "Other")}</strong>
                {address.is_default && <span>Default</span>}
                <MoreVertical size={17} />
              </div>
              <p>{address.street_address || "Address not provided"}</p>
              <small>{address.area}, {address.city || "Zanzibar"}</small>
              <small>{address.contact_phone || user.phone_number}</small>
            </article>
          ))}
        </div>
        <form className="profile-address-form" onSubmit={saveAddress}>
          <input value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} placeholder="New street / hotel / landmark" required />
          <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" required />
          <button type="button" onClick={() => useCurrentLocation()}>Use GPS</button>
          <button disabled={savingAddress}>{savingAddress ? "Saving..." : "Save Address"}</button>
        </form>
        {locationMessage && <p className="data-note">{locationMessage}</p>}
        {addressError && <p className="form-error">{addressError}</p>}
      </section>

      <section className="profile-block">
        <h2>Delivery preferences</h2>
        <div className="preference-grid">
          <Preference icon={Package} title="Delivery Instructions" value="Leave at my door" note="Ring the bell if not available" />
          <Preference icon={CalendarDays} title="Preferred Time" value="Evening (5 PM - 9 PM)" note="You usually order in the evening" />
          <Preference icon={CreditCard} title="Payment Method" value="Cash on Delivery" note="You can change this at checkout" />
        </div>
      </section>

      <section className="profile-block">
        <h2>Your activity</h2>
        <div className="activity-grid">
          <Activity icon={Package} title="Total Orders" value="18" link="View your orders" href="/orders" />
          <Activity icon={Star} title="Average Rating" value="4.7" link="See all reviews" href="/orders" />
          <Activity icon={Heart} title="Favorites" value="12" link="View favorites" href="/favorites" />
          <Activity icon={ReceiptText} title="Offers Used" value="7" link="View offers" href="/settings" />
        </div>
      </section>

      <section className="profile-security-strip">
        <div><ShieldCheck size={24} /><span><strong>Keep your account secure</strong><small>Change your password regularly to keep your account safe.</small></span></div>
        <Link href="/settings"><LockKeyhole size={15} /> Change Password</Link>
      </section>
    </div>
  );
}

function Preference({ icon: Icon, title, value, note }: { icon: typeof Package; title: string; value: string; note: string }) {
  return (
    <article className="preference-card">
      <Icon size={22} />
      <span><strong>{title}</strong><b>{value}</b><small>{note}</small></span>
      <i>›</i>
    </article>
  );
}

function Activity({ icon: Icon, title, value, link, href }: { icon: typeof Package; title: string; value: string; link: string; href: string }) {
  return (
    <article className="activity-card">
      <Icon size={24} />
      <span>{title}</span>
      <strong>{value}</strong>
      <Link href={href}>{link} →</Link>
    </article>
  );
}
