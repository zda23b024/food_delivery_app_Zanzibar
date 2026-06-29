"use client";

import { RemoteTable } from "@/components/RemoteTable";
import { payments } from "@/data/mock";
import { adminApi } from "@/services/api";

export default function PaymentsPage() {
  return (
    <div>
      <div className="page-head"><div><h1>Payments</h1><p>M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, refunds, and callbacks.</p></div></div>
      <RemoteTable
        columns={[
        { key: "id", label: "Payment" },
        { key: "method", label: "Method" },
        { key: "status", label: "Status" },
        { key: "reference", label: "Reference" },
        { key: "amount", label: "Amount" }
        ]}
        fallbackRows={payments}
        loadRows={async (token) => {
          const livePayments = await adminApi.payments(token || "");
          return (livePayments as any[]).map((payment) => ({
            id: payment.id.slice(0, 8),
            method: payment.provider || payment.method,
            status: payment.status,
            reference: payment.provider_reference || "-",
            amount: `TZS ${Number(payment.amount || 0).toLocaleString()}`
          }));
        }}
      />
    </div>
  );
}
