import { BadgePercent, Plus } from "lucide-react";
import { promotions } from "@/data/mock";

export default function PromotionsPage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Promotions</h1>
          <p>Manage discounts, sponsored visibility, and tourist/hotel delivery campaigns.</p>
        </div>
        <button className="primary-button">
          <Plus size={17} />
          New Promotion
        </button>
      </div>
      <div className="profile-grid">
        {promotions.map((promotion) => (
          <section className="panel" key={promotion.id}>
            <div className="row between">
              <BadgePercent size={22} color="#d95700" />
              <span className={promotion.status === "active" ? "tag green" : "tag"}>{promotion.status}</span>
            </div>
            <h2>{promotion.title}</h2>
            <p className="muted">{promotion.type} - {promotion.discount}</p>
            <strong>{promotion.period}</strong>
          </section>
        ))}
      </div>
    </div>
  );
}
