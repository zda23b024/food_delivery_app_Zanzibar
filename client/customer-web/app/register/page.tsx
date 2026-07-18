"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Apple, BadgeCheck, Bike, Building2, LockKeyhole, Mail, MapPin, Phone, Store, Upload, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { navigateByRole } from "@/utils/authRedirect";
import { getCurrentGpsLocation } from "@/utils/geolocation";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="auth-page auth-mock-page"><section className="auth-mock-card food"><div className="auth-mock-visual" /><div className="auth-mock-form">Loading...</div></section></div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+255");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "restaurant" | "rider">("customer");
  const [streetAddress, setStreetAddress] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [vehicleType, setVehicleType] = useState("motorbike");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const roleContent = {
    customer: {
      icon: User,
      title: "Create Account",
      subtitle: "Join Zanmart and enjoy delicious food",
      visual: "food",
      button: "Register"
    },
    rider: {
      icon: Bike,
      title: "Become a Rider",
      subtitle: "Deliver smiles and earn with Zanmart",
      visual: "rider",
      button: "Register as Rider"
    },
    restaurant: {
      icon: Store,
      title: "Register Restaurant",
      subtitle: "Grow your business with Zanmart",
      visual: "restaurant",
      button: "Register Restaurant"
    }
  };
  const active = roleContent[role];

  useEffect(() => {
    const requestedRole = searchParams?.get("role");
    if (requestedRole === "restaurant" || requestedRole === "rider" || requestedRole === "customer") {
      setRole(requestedRole);
    }
    useCurrentLocation();
  }, [searchParams]);

  async function useCurrentLocation() {
    setLocationMessage("Getting your real GPS location...");
    try {
      const gps = await getCurrentGpsLocation();
      setLatitude(gps.latitude);
      setLongitude(gps.longitude);
      if (gps.address) {
        setStreetAddress(gps.address.formatted_address);
        setArea(gps.address.area);
      }
      setLocationMessage(`GPS location captured${gps.address?.area ? ` near ${gps.address.area}` : ""}. Accuracy about ${Math.round(gps.accuracy)}m.`);
    } catch (err) {
      setLocationMessage(err instanceof Error ? err.message : "Could not access GPS location. Allow location permission.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (role === "restaurant" && (!businessName || !certificateNumber || !verificationFile)) {
      setError("Restaurant registration requires business name, certificate number, and certificate upload.");
      return;
    }
    if (role === "rider" && (!vehicleType || !licenseNumber || !nationalIdNumber || !verificationFile)) {
      setError("Rider registration requires vehicle type, licence number, national ID, and proof upload.");
      return;
    }
    setSubmitting(true);
    try {
      const profile = await register({
        full_name: fullName,
        email: email || undefined,
        phone_number: phoneNumber,
        preferred_language: preferredLanguage,
        password,
        role,
        location: {
          street_address: streetAddress || undefined,
          area: area || undefined,
          city: "Zanzibar",
          island: "Unguja",
          latitude,
          longitude
        },
        verification: role === "customer" ? undefined : {
          document: verificationFile,
          document_type: role === "restaurant" ? "business_certificate" : "rider_identity_and_license",
          business_name: businessName || undefined,
          certificate_number: certificateNumber || undefined,
          tax_id: taxId || undefined,
          business_address: streetAddress || undefined,
          service_area: area || undefined,
          vehicle_type: vehicleType || undefined,
          vehicle_plate_number: vehiclePlateNumber || undefined,
          license_number: licenseNumber || undefined,
          national_id_number: nationalIdNumber || undefined,
          notes: role === "restaurant"
            ? "Restaurant account pending certificate review."
            : "Rider account pending identity, licence, and vehicle review."
        }
      });
      navigateByRole(profile.role, "/profile", router.push);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page auth-mock-page">
      <div className="auth-role-tabs">
        {(Object.keys(roleContent) as (keyof typeof roleContent)[]).map((roleKey) => {
          const Icon = roleContent[roleKey].icon;
          return (
            <button key={roleKey} className={role === roleKey ? "active" : ""} type="button" onClick={() => setRole(roleKey)}>
              <Icon size={21} />
              {roleKey}
            </button>
          );
        })}
      </div>

      <section className={`auth-mock-card register ${active.visual}`}>
        <div className="auth-mock-visual" />
        <div className="auth-mock-form">
          <img src="/zanmart-mark.svg" alt="Zanmart Food Delivery" className="auth-mock-logo auth-mock-logo-mark" />
          <h1>{active.title}</h1>
          <p>{active.subtitle}</p>

        <form className="auth-compact-form" onSubmit={handleSubmit}>
          <label className="auth-input-line">
            <User size={15} />
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} placeholder={role === "restaurant" ? "Owner name" : "Full name"} />
          </label>
          <label className="auth-input-line">
            <Phone size={15} />
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Phone number" required />
          </label>
          <label className="auth-input-line">
            <Mail size={15} />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email address" />
          </label>
          <label className="auth-input-line">
            <LockKeyhole size={15} />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required placeholder="Password" />
          </label>
          <label className="auth-input-line">
            <MapPin size={15} />
            <input
              value={streetAddress}
              onChange={(event) => setStreetAddress(event.target.value)}
              placeholder={role === "rider" ? "Service area" : role === "restaurant" ? "Restaurant location" : "Delivery address"}
            />
          </label>
          <button type="button" className="auth-light-button" onClick={useCurrentLocation}>Use real GPS location</button>
          {locationMessage && <p className="auth-location-note">{locationMessage}</p>}
          {role === "restaurant" && (
            <section className="role-onboarding-panel compact-role-panel">
              <div className="role-onboarding-head">
                <span><Store size={18} /></span>
                <div>
                  <h3>Restaurant verification</h3>
                  <p>Required before the restaurant can receive real orders.</p>
                </div>
              </div>
              <label className="auth-input-line"><Building2 size={15} /><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Restaurant name" required={role === "restaurant"} /></label>
              <label className="auth-input-line"><BadgeCheck size={15} /><input value={certificateNumber} onChange={(event) => setCertificateNumber(event.target.value)} placeholder="Business certificate number" required={role === "restaurant"} /></label>
              <label className="auth-input-line"><BadgeCheck size={15} /><input value={taxId} onChange={(event) => setTaxId(event.target.value)} placeholder="TIN / tax ID" /></label>
              <label className="upload-drop">
                <Upload size={20} />
                <span>
                  <strong>{verificationFile ? verificationFile.name : "Upload business certificate"}</strong>
                  <small>PDF, JPG, PNG, or WEBP. Trade licence, food permit, or registration certificate.</small>
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => setVerificationFile(event.target.files?.[0] || null)}
                  required={role === "restaurant"}
                />
              </label>
            </section>
          )}

          {role === "rider" && (
            <section className="role-onboarding-panel compact-role-panel">
              <div className="role-onboarding-head">
                <span><Bike size={18} /></span>
                <div>
                  <h3>Rider verification</h3>
                  <p>Required before accepting delivery jobs.</p>
                </div>
              </div>
              <label className="auth-input-line">
                <Bike size={15} />
                <select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} required={role === "rider"}>
                  <option value="motorbike">Motorbike</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                  <option value="walking">Walking</option>
                </select>
              </label>
              <label className="auth-input-line"><BadgeCheck size={15} /><input value={vehiclePlateNumber} onChange={(event) => setVehiclePlateNumber(event.target.value)} placeholder="Vehicle plate number" /></label>
              <label className="auth-input-line"><BadgeCheck size={15} /><input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="Driving licence number" required={role === "rider"} /></label>
              <label className="auth-input-line"><BadgeCheck size={15} /><input value={nationalIdNumber} onChange={(event) => setNationalIdNumber(event.target.value)} placeholder="National ID / Zanzibar ID" required={role === "rider"} /></label>
              <label className="upload-drop">
                <BadgeCheck size={20} />
                <span>
                  <strong>{verificationFile ? verificationFile.name : "Upload rider proof document"}</strong>
                  <small>PDF, JPG, PNG, or WEBP. ID, licence, vehicle card, or police clearance.</small>
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => setVerificationFile(event.target.files?.[0] || null)}
                  required={role === "rider"}
                />
              </label>
            </section>
          )}
          {error && <p className="form-error">{error}</p>}
          <button className="auth-orange-button" disabled={submitting}>
            {submitting ? "Creating account..." : active.button}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>
        <div className="social-row">
          <button type="button" onClick={() => setError("Google registration is not configured yet. Use the form above.")}>G</button>
          <button type="button" onClick={() => setError("Facebook registration is not configured yet. Use the form above.")}>f</button>
          <button type="button" onClick={() => setError("Apple registration is not configured yet. Use the form above.")}><Apple size={15} /></button>
        </div>
        <p className="auth-switch mini">
          Already have an account? <Link href="/login">Login</Link>
        </p>
        </div>
      </section>
    </div>
  );
}
