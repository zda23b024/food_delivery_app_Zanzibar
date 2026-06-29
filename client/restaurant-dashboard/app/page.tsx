import { BadgePercent, Clock, DollarSign, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { OrderTable } from "@/components/OrderTable";
import { StatCard } from "@/components/StatCard";
import { menuItems, orders } from "@/data/mock";
import { formatMoney } from "@/utils/money";

export default function OverviewPage() {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pending = orders.filter((order) => ["pending", "accepted", "preparing"].includes(order.status)).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Restaurant Overview</h1>
          <p>Monitor orders, revenue, menu availability, and service readiness.</p>
        </div>
        <Link href="/menu/new" className="primary-button">Add Food Item</Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Today Revenue" value={formatMoney(revenue)} hint="From active dashboard orders" icon={DollarSign} />
        <StatCard label="Active Orders" value={String(pending)} hint="Need restaurant attention" icon={ShoppingBag} />
        <StatCard label="Avg Prep Time" value="18 min" hint="Target under 22 minutes" icon={Clock} />
        <StatCard label="Menu Items" value={String(menuItems.length)} hint="2 featured today" icon={BadgePercent} />
      </div>

      <div className="page-head">
        <div>
          <h1>Live Orders</h1>
          <p>Accept, prepare, and mark orders ready for pickup.</p>
        </div>
      </div>
      <OrderTable orders={orders} />
    </div>
  );
}
