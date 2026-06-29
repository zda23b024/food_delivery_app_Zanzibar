import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: LucideIcon }) {
  return (
    <section className="stat-card">
      <div className="row between">
        <span>{label}</span>
        <Icon size={20} />
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </section>
  );
}
