import Link from "next/link";
import { Shield } from "lucide-react";

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || "http://localhost:3002/login";

export default function AdminLoginHandoffPage() {
  return (
    <main className="auth-page auth-role-chooser-page">
      <section className="admin-credentials-card">
        <Shield size={38} />
        <h1>Admin Portal</h1>
        <p>Administrators sign in from the separate admin dashboard, not the customer app.</p>
        <a className="auth-orange-button" href={adminUrl}>Open Admin Login</a>
        <Link className="auth-demo-link" href="/login">Back to customer login</Link>
      </section>
    </main>
  );
}
