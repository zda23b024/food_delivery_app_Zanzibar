"use client";

import { RemoteTable } from "@/components/RemoteTable";
import { adminApi } from "@/services/api";
import { users } from "@/data/mock";

export default function UsersPage() {
  return (
    <div>
      <div className="page-head"><div><h1>Users</h1><p>Customers, restaurant owners, riders, and administrators.</p></div></div>
      <RemoteTable
        columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" }
        ]}
        fallbackRows={users}
        loadRows={async (token) => {
          const liveUsers = await adminApi.users(token || "");
          return (liveUsers as any[]).map((user) => ({
            id: user.id,
            name: user.full_name,
            role: user.role,
            phone: user.phone_number,
            status: user.is_active ? "Active" : "Inactive"
          }));
        }}
      />
    </div>
  );
}
