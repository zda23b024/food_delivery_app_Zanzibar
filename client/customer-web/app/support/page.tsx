"use client";

import Link from "next/link";
import { Headphones, Mail, MessageCircle, Phone, ShieldQuestion } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="support-page">
      <section className="support-hero">
        <span className="app-pill"><Headphones size={15} /> Help & Support</span>
        <h1>How can we help?</h1>
        <p>Get support for orders, payments, delivery tracking, restaurant accounts, and rider onboarding.</p>
      </section>

      <div className="support-grid">
        <article>
          <MessageCircle size={24} />
          <h2>Live Chat</h2>
          <p>Chat with support about active orders, refunds, or delivery issues.</p>
          <a href="mailto:support@zanmart.local?subject=Zanmart%20support%20chat">Start Chat</a>
        </article>
        <article>
          <Phone size={24} />
          <h2>Call Us</h2>
          <p>Reach Zanmart support for urgent order or rider assistance.</p>
          <a href="tel:+255765000123">+255 765 000 123</a>
        </article>
        <article>
          <Mail size={24} />
          <h2>Email Support</h2>
          <p>Send details about account, payment, or restaurant verification problems.</p>
          <a href="mailto:support@zanmart.local">support@zanmart.local</a>
        </article>
      </div>

      <section className="support-faq">
        <h2>Quick answers</h2>
        <details open>
          <summary><ShieldQuestion size={16} /> Where can I track my order?</summary>
          <p>Open the Orders page and use Track Order on your active order.</p>
        </details>
        <details>
          <summary><ShieldQuestion size={16} /> How do restaurant/rider documents get approved?</summary>
          <p>After upload, documents remain pending until an administrator reviews them.</p>
        </details>
        <details>
          <summary><ShieldQuestion size={16} /> Can I change my saved address?</summary>
          <p>Go to Profile, use GPS or type a new address, then save it for checkout.</p>
        </details>
      </section>

      <Link href="/orders" className="primary-button">View Orders</Link>
    </div>
  );
}
