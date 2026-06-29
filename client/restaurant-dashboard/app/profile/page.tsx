import { Hotel, MapPin, Phone, Star, Umbrella } from "lucide-react";

export default function ProfilePage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Restaurant Profile</h1>
          <p>Public restaurant information shown to customers and tourists.</p>
        </div>
      </div>
      <div className="profile-grid">
        <section className="panel">
          <h2>Stone Grill Zanzibar</h2>
          <p className="muted">Swahili BBQ, seafood, pilau, and fresh juices.</p>
          <div className="row"><Phone size={15} /> +255 777 111 222</div>
          <div className="row"><MapPin size={15} /> Mkunazini Street, Stone Town</div>
          <div className="row"><Star size={15} /> 4.8 average rating</div>
        </section>
        <section className="panel">
          <h2>Delivery Capabilities</h2>
          <div className="row"><Hotel size={15} /> Hotel delivery enabled</div>
          <div className="row"><Umbrella size={15} /> Beach delivery available by schedule</div>
          <span className="tag green">Open today</span>
        </section>
      </div>
    </div>
  );
}
