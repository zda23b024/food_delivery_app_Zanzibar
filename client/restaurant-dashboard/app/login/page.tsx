"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("+255");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(phoneNumber, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your restaurant account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-mark">Z</span>
          <span>
            <strong>ZanMeal</strong>
            <small>Restaurant login</small>
          </span>
        </div>
        <div>
          <h1>Restaurant Login</h1>
          <p className="muted">Use your restaurant owner account to sync orders, menu, and promotions.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Phone number</label>
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" disabled={submitting}>
            <LogIn size={17} />
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </div>
  );
}
