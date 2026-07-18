"use client";

import { useEffect, useState } from "react";
import { Power, RefreshCw } from "lucide-react";
import { LiveTable } from "@/components/LiveTable";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";

type UserRow = { id: string; name: string; role: string; phone: string; status: string };
const roles = ["customer", "restaurant", "rider", "admin"];

export default function UsersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("Login as admin to load users.");

  async function load() {
    if (!token) return;
    setMessage("Loading users...");
    try {
      const liveUsers = await adminApi.users(token);
      setRows((liveUsers as any[]).map((user) => ({
        id: user.id,
        name: user.full_name,
        role: user.role,
        phone: user.phone_number,
        status: user.is_active ? "Active" : "Inactive"
      })));
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load users.");
    }
  }

  async function changeRole(userId: string, role: string) {
    if (!token) return setMessage("Login as admin to update users.");
    setMessage("Updating user role...");
    try {
      await adminApi.updateUser(userId, { role }, token);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update user.");
    }
  }

  async function toggle(row: UserRow) {
    if (!token) return setMessage("Login as admin to update users.");
    setMessage("Updating user status...");
    try {
      await adminApi.updateUser(row.id, { is_active: row.status !== "Active" }, token);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update user.");
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div>
      <div className="page-head">
        <div><h1>Users</h1><p>Customers, restaurant owners, riders, and administrators.</p></div>
        <button className="primary-button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>
      {message && <p className="muted">{message}</p>}
      <LiveTable columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" }
      ]} rows={rows} actions={(row) => (
        <>
          <select className="inline-select" value={row.role} onChange={(event) => changeRole(row.id, event.target.value)}>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <button className="mini-button" onClick={() => toggle(row)}><Power size={14} /> {row.status === "Active" ? "Disable" : "Enable"}</button>
        </>
      )} />
    </div>
  );
}
