"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+255");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        full_name: fullName,
        email: email || undefined,
        phone_number: phoneNumber,
        preferred_language: preferredLanguage,
        password
      });
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel wide">
        <div className="brand auth-brand">
          <span className="brand-mark">Z</span>
          <span>
            <strong>ZanMeal</strong>
            <small>Create customer account</small>
          </span>
        </div>

        <div>
          <h1>Join ZanMeal</h1>
          <p>Create your customer account for food, hotel delivery, beach delivery, favorites, and order tracking.</p>
        </div>

        <form className="form-grid two-col" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} />
          </div>
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
            <label>Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </div>
          <div className="field">
            <label>Language</label>
            <select value={preferredLanguage} onChange={(event) => setPreferredLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="field form-span">
            <label>Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
            />
          </div>
          {error && <p className="form-error form-span">{error}</p>}
          <button className="primary-button full form-span" disabled={submitting}>
            <UserPlus size={17} />
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </div>
  );
}
