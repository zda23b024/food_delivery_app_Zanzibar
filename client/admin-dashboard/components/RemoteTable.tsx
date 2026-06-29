"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/contexts/AuthContext";

type Column<T> = {
  key: keyof T;
  label: string;
};

type RemoteTableProps<T extends Record<string, string | number>> = {
  columns: Column<T>[];
  fallbackRows: T[];
  loadRows: (token: string | null) => Promise<T[]>;
  loginRequired?: boolean;
};

export function RemoteTable<T extends Record<string, string | number>>({
  columns,
  fallbackRows,
  loadRows,
  loginRequired = true
}: RemoteTableProps<T>) {
  const { token } = useAuth();
  const [rows, setRows] = useState<T[]>(fallbackRows);
  const [state, setState] = useState<"loading" | "ready" | "demo" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loginRequired && !token) {
      setRows(fallbackRows);
      setState("demo");
      setMessage("Login as an administrator to load live backend data. Showing demo data for now.");
      return;
    }

    let active = true;
    setState("loading");
    loadRows(token)
      .then((loadedRows) => {
        if (!active) return;
        setRows(loadedRows);
        setState("ready");
        setMessage(loadedRows.length ? "" : "No live records found yet.");
      })
      .catch((error: Error) => {
        if (!active) return;
        setRows(fallbackRows);
        setState("error");
        setMessage(`${error.message}. Showing demo data until the backend is ready.`);
      });

    return () => {
      active = false;
    };
  }, [loginRequired, token]);

  return (
    <div>
      {state !== "ready" || message ? <p className="muted">{state === "loading" ? "Loading live data..." : message}</p> : null}
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
