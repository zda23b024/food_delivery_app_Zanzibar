"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { LiveTable } from "@/components/LiveTable";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";

const paymentStatuses = ["pending", "processing", "authorized", "paid", "failed", "refunded", "cod_pending"];

type PaymentRow = {
  id: string;
  payment: string;
  method: string;
  status: string;
  reference: string;
  amount: string;
};

export default function PaymentsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [message, setMessage] = useState("Login as admin to load payments.");

  async function load() {
    if (!token) return;
    setMessage("Loading payments...");
    try {
      const livePayments = await adminApi.payments(token);
      setRows((livePayments as any[]).map((payment) => ({
        id: payment.id,
        payment: payment.id.slice(0, 8),
        method: payment.provider || payment.method,
        status: payment.status,
        reference: payment.provider_reference || "-",
        amount: `TZS ${Number(payment.amount || 0).toLocaleString()}`
      })));
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load payments.");
    }
  }

  async function changeStatus(paymentId: string, status: string) {
    if (!token) return setMessage("Login as admin to update payments.");
    setMessage("Updating payment...");
    try {
      await adminApi.updatePayment(paymentId, { status }, token);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update payment.");
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="page-head">
        <div><h1>Payments</h1><p>M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, refunds, and callbacks.</p></div>
        <button className="primary-button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>
      {message && <p className="muted">{message}</p>}
      <LiveTable columns={[
        { key: "payment", label: "Payment" },
        { key: "method", label: "Method" },
        { key: "status", label: "Status" },
        { key: "reference", label: "Reference" },
        { key: "amount", label: "Amount" }
      ]} rows={rows} actions={(row) => (
        <select className="inline-select" value={row.status} onChange={(event) => changeStatus(row.id, event.target.value)}>
          {paymentStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
        </select>
      )} />
    </div>
  );
}
