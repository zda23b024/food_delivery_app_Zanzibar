"use client";

import { FormEvent, useEffect, useState } from "react";
import { Hotel, MapPin, Phone, Save, Star, Umbrella } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { restaurantApi } from "@/services/api";
import { findOwnedRestaurant } from "@/utils/backend";

export default function ProfilePage() {
  const { accessToken, user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [supportsHotel, setSupportsHotel] = useState(false);
  const [supportsBeach, setSupportsBeach] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [rating, setRating] = useState("0.0");
  const [message, setMessage] = useState("Loading restaurant profile...");
  const [error, setError] = useState("");

  useEffect(() => {
    restaurantApi
      .getRestaurants()
      .then((restaurants) => {
        const owned = findOwnedRestaurant(restaurants as any[], user?.id);
        if (!owned) {
          setMessage("No restaurant profile is linked to this account yet.");
          return;
        }
        setRestaurantId(owned.id);
        setName(owned.name || "");
        setDescription(owned.description || "");
        setPhoneNumber(owned.phone_number || "");
        setCuisineType(owned.cuisine_type || "");
        setAddress(owned.address || "");
        setArea(owned.area || "");
        setSupportsHotel(Boolean(owned.supports_hotel_delivery));
        setSupportsBeach(Boolean(owned.supports_beach_delivery));
        setIsOpen(Boolean(owned.is_open));
        setRating(Number(owned.average_rating || 0).toFixed(1));
        setMessage("");
      })
      .catch((err: Error) => setError(err.message));
  }, [user?.id]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
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
          name,
          description,
          phone_number: phoneNumber,
          cuisine_type: cuisineType,
          address,
          area,
          supports_hotel_delivery: supportsHotel,
          supports_beach_delivery: supportsBeach,
          is_open: isOpen
        },
        accessToken
      );
      setMessage("Restaurant profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save restaurant profile.");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Restaurant Profile</h1>
          <p>Public restaurant information shown to customers and tourists.</p>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}
      <div className="profile-grid">
        <section className="panel">
          <h2>{name || "Restaurant"}</h2>
          <p className="muted">{description || "Add a public restaurant description."}</p>
          <div className="row"><Phone size={15} /> {phoneNumber || "No phone yet"}</div>
          <div className="row"><MapPin size={15} /> {address || "No address yet"}{area ? `, ${area}` : ""}</div>
          <div className="row"><Star size={15} /> {rating} average rating</div>
        </section>
        <section className="panel">
          <h2>Delivery Capabilities</h2>
          <div className="row"><Hotel size={15} /> Hotel delivery {supportsHotel ? "enabled" : "disabled"}</div>
          <div className="row"><Umbrella size={15} /> Beach delivery {supportsBeach ? "enabled" : "disabled"}</div>
          <span className={isOpen ? "tag green" : "tag"}>{isOpen ? "Open today" : "Closed"}</span>
        </section>
      </div>

      <section className="form-panel">
        <form className="form-grid two-col" onSubmit={saveProfile}>
          <div className="field">
            <label>Restaurant name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required />
          </div>
          <div className="field">
            <label>Cuisine type</label>
            <input value={cuisineType} onChange={(event) => setCuisineType(event.target.value)} />
          </div>
          <div className="field">
            <label>Area</label>
            <input value={area} onChange={(event) => setArea(event.target.value)} required />
          </div>
          <div className="field form-span">
            <label>Address</label>
            <input value={address} onChange={(event) => setAddress(event.target.value)} required />
          </div>
          <div className="field form-span">
            <label>Description</label>
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <label className="row">
            <input type="checkbox" checked={isOpen} onChange={(event) => setIsOpen(event.target.checked)} />
            Restaurant is open
          </label>
          <label className="row">
            <input type="checkbox" checked={supportsHotel} onChange={(event) => setSupportsHotel(event.target.checked)} />
            Hotel delivery
          </label>
          <label className="row">
            <input type="checkbox" checked={supportsBeach} onChange={(event) => setSupportsBeach(event.target.checked)} />
            Beach delivery
          </label>
          <button className="primary-button form-span">
            <Save size={17} />
            Save Restaurant Profile
          </button>
        </form>
      </section>
    </div>
  );
}
