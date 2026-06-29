import { Banknote, CreditCard, DollarSign, ReceiptText } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { orders } from "@/data/mock";
import { formatMoney } from "@/utils/money";

export default function EarningsPage() {
  const gross = orders.reduce((sum, order) => sum + order.total, 0);
  const commission = gross * 0.15;
  const payout = gross - commission;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Earnings</h1>
          <p>Track revenue, commissions, and expected restaurant payout.</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard label="Gross Sales" value={formatMoney(gross)} hint="Before commission" icon={DollarSign} />
        <StatCard label="Commission" value={formatMoney(commission)} hint="Estimated 15%" icon={ReceiptText} />
        <StatCard label="Payout" value={formatMoney(payout)} hint="Expected transfer" icon={Banknote} />
        <StatCard label="Payments" value="Mobile Money" hint="M-Pesa, Airtel, Tigo, HaloPesa" icon={CreditCard} />
      </div>
      <section className="panel">
        <h2>Payout Notes</h2>
        <p className="muted">Production payouts will connect to verified restaurant bank/mobile money accounts once merchant payment credentials are configured.</p>
      </section>
    </div>
  );
}
