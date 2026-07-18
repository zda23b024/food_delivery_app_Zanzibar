"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("+255");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await login(phone, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed.");
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div>
          <div className="hero-copy">
            <div className="hero-tag">Platform administrator login</div>
            <h1>Admin Login</h1>
            <p className="muted">Sign in to manage users, restaurants, riders, and platform operations securely.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Phone number</label>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button">Login</button>
        </form>
      </section>
    </div>
  );
}
