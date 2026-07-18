import Link from "next/link";
import { Bike, Shield, Store, User } from "lucide-react";

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || "http://localhost:3002/login";

export default function LoginChooserPage() {
  return (
    <main className="auth-page auth-role-chooser-page">
      <section className="auth-role-chooser-head">
        <img src="/zanmart-mark.svg" alt="Zanmart" className="auth-mock-logo auth-mock-logo-mark" />
        <h1>Login to Zanmart</h1>
        <p>Choose your account type to continue to the correct experience.</p>
        <div className="auth-role-chooser-meta">
          <span>Secure sign-in</span>
          <span>Fast checkout</span>
          <span>Live updates</span>
        </div>
      </section>

      <section className="auth-role-choice-grid">
        <Link href="/login/customer" className="auth-role-choice food">
          <User size={28} />
          <strong>Customer Login</strong>
          <span>Order food, save favorites, checkout, and track delivery.</span>
        </Link>
        <Link href="/login/rider" className="auth-role-choice rider">
          <Bike size={28} />
          <strong>Rider Login</strong>
          <span>Manage deliveries, navigation, earnings, and live tracking.</span>
        </Link>
        <Link href="/login/restaurant" className="auth-role-choice restaurant">
          <Store size={28} />
          <strong>Restaurant Login</strong>
          <span>Manage orders, menus, restaurant profile, and settings.</span>
        </Link>
      </section>

      <a className="admin-external-link" href={adminUrl}>
        <Shield size={17} />
        Admin portal is separate: open admin dashboard
      </a>
    </main>
  );
}
