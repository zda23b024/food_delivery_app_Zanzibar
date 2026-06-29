"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.push(nextPath || "/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <span className="brand-mark">Z</span>
          <span>
            <strong>ZanMeal</strong>
            <small>Customer login</small>
          </span>
        </div>

        <div>
          <h1>Welcome back</h1>
          <p>Login with your phone number to continue ordering across Zanzibar.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Phone number</label>
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+255700000001"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full" disabled={submitting}>
            <LogIn size={17} />
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New to ZanMeal? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
