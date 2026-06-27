import { MapPin, Phone, ShieldCheck, Star } from "lucide-react";

export default function ProfilePage() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Profile</h2>
          <p>Manage your account, addresses, loyalty, and delivery preferences.</p>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-panel">
          <div className="row between">
            <div>
              <h2>Amina Ali</h2>
              <p>Customer - English</p>
            </div>
            <span className="brand-mark">AA</span>
          </div>
          <div className="tag-row">
            <span><Phone size={13} /> +255 700 000 000</span>
            <span><ShieldCheck size={13} /> Verified</span>
            <span><Star size={13} /> 1,240 points</span>
          </div>
        </section>
        <section className="profile-panel">
          <h2>Saved Addresses</h2>
          <p><MapPin size={14} /> Mkunazini Street, Stone Town, Zanzibar</p>
          <p><MapPin size={14} /> Nungwi Beach Hotel, North Unguja</p>
        </section>
      </div>
    </div>
  );
}
