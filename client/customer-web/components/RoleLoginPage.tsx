"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Apple, Bike, LockKeyhole, Mail, Phone, Store, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { navigateByRole } from "@/utils/authRedirect";

export type LoginRole = "customer" | "rider" | "restaurant";

const roleConfig = {
  customer: {
    title: "Customer Login",
    subtitle: "Login to continue your food journey",
    visual: "food",
    icon: User,
    identifierLabel: "Email or Phone Number",
    identifierIcon: Phone,
    defaultIdentifier: "+255",
    registerHref: "/register?role=customer",
    registerText: "Register"
  },
  rider: {
    title: "Rider Login",
    subtitle: "Login to manage your deliveries",
    visual: "rider",
    icon: Bike,
    identifierLabel: "Phone Number",
    identifierIcon: Phone,
    defaultIdentifier: "+255",
    registerHref: "/register?role=rider",
    registerText: "Register as Rider"
  },
  restaurant: {
    title: "Restaurant Login",
    subtitle: "Access your restaurant dashboard",
    visual: "restaurant",
    icon: Store,
    identifierLabel: "Email Address",
    identifierIcon: Mail,
    defaultIdentifier: "",
    registerHref: "/register?role=restaurant",
    registerText: "Register"
  }
} satisfies Record<LoginRole, unknown>;

export function RoleLoginPage({ role }: { role: LoginRole }) {
  const router = useRouter();
  const { login, logout } = useAuth();
  const config = roleConfig[role];
  const IdentifierIcon = config.identifierIcon;
  const [identifier, setIdentifier] = useState(config.defaultIdentifier);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const profile = await login(identifier, password);
      if ((profile.role || "").toLowerCase() !== role) {
        await logout();
        setError(`This account is registered as ${profile.role}. Please use the correct ${profile.role} login.`);
        return;
      }
      const nextPath = new URLSearchParams(window.location.search).get("next") || "/profile";
      navigateByRole(profile.role, nextPath, router.push);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page auth-single-role-page">
      <div className="auth-single-role-top">
        <Link href="/login/customer" className={role === "customer" ? "active" : ""}><User size={20} /> Customer</Link>
        <Link href="/login/rider" className={role === "rider" ? "active" : ""}><Bike size={20} /> Rider</Link>
        <Link href="/login/restaurant" className={role === "restaurant" ? "active" : ""}><Store size={20} /> Restaurant</Link>
      </div>

      <article className={`auth-single-role-card ${config.visual}`}>
        <div className="auth-gallery-visual" />
        <div className="auth-gallery-form">
          <img src="/zanmart-mark.svg" alt="Zanmart Food Delivery" className="auth-mock-logo auth-mock-logo-mark" />
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
          <div className="auth-role-helper">
            <span className="auth-role-helper-pill">Protected access</span>
            <span className="auth-role-helper-pill">Rapid support</span>
          </div>
          <form className="auth-compact-form" onSubmit={handleSubmit}>
            <label className="auth-input-line">
              <IdentifierIcon size={15} />
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={config.identifierLabel} required />
            </label>
            <label className="auth-input-line">
              <LockKeyhole size={15} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" minLength={8} required />
            </label>
            <div className="auth-mini-row">
              <label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
              <Link href="/support">Forgot Password?</Link>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="auth-orange-button" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</button>
          </form>
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="social-row">
            <button type="button" onClick={() => setError("Google login is not configured yet. Use phone/email login.")}>G</button>
            <button type="button" onClick={() => setError("Facebook login is not configured yet. Use phone/email login.")}>f</button>
            <button type="button" onClick={() => setError("Apple login is not configured yet. Use phone/email login.")}><Apple size={15} /></button>
          </div>
          <p className="auth-switch mini">Don&apos;t have an account? <Link href={config.registerHref}>{config.registerText}</Link></p>
          <Link className="auth-demo-link" href="/login">Choose another role</Link>
        </div>
      </article>
    </div>
  );
}
