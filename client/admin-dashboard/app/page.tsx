import { Bike, CreditCard, ShoppingBag, Store } from "lucide-react";
import { platformStats, orders } from "@/data/mock";
import { DataTable } from "@/components/DataTable";

const icons = [ShoppingBag, CreditCard, Store, Bike];

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Platform Overview</h1>
          <p>Monitor Zanmart operations across customers, restaurants, riders, payments, and coverage zones.</p>
        </div>
      </div>
      <div className="stats-grid">
        {platformStats.map((stat, index) => {
          const Icon = icons[index];
          return (
            <section className="stat-card" key={stat.label}>
              <div className="row"><Icon size={20} color="#d95700" /> {stat.label}</div>
              <strong>{stat.value}</strong>
              <span className="muted">{stat.hint}</span>
            </section>
          );
        })}
      </div>
      <DataTable columns={[
        { key: "id", label: "Order" },
        { key: "customer", label: "Customer" },
        { key: "restaurant", label: "Restaurant" },
        { key: "status", label: "Status" },
        { key: "total", label: "Total" }
      ]} rows={orders} />
    </div>
  );
}
