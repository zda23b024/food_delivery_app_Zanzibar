import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminCredentialsPage() {
  return (
    <main className="auth-page auth-gallery-page admin-credentials-page">
      <section className="admin-credentials-card">
        <img src="/zanmart-mark.svg" alt="Zanmart" className="auth-mock-logo auth-mock-logo-mark" />
        <h1>Admin Demo Credentials</h1>
        <p>Use these credentials only for local/demo development.</p>
        <div>
          <span>Email</span>
          <strong>admin@zanmart.local</strong>
        </div>
        <div>
          <span>Phone</span>
          <strong>+255700100001</strong>
        </div>
        <div>
          <span>Password</span>
          <strong>Password123</strong>
        </div>
        <Link className="auth-orange-button" href="/admin-login"><Shield size={15} /> Go to Admin Login</Link>
      </section>
    </main>
  );
}
