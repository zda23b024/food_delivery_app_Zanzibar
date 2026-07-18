"use client";

import type React from "react";

type Column<T> = {
  key: keyof T;
  label: string;
};

export function LiveTable<T extends { id?: string | number }>({
  columns,
  rows,
  actions
}: {
  columns: Column<T>[];
  rows: T[];
  actions?: (row: T) => React.ReactNode;
}) {
  const columnCount = columns.length + (actions ? 1 : 0);
  return (
    <div className="table-card">
      <div className="table-head" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {columns.map((column) => <span key={String(column.key)}>{column.label}</span>)}
        {actions ? <span>Actions</span> : null}
      </div>
      {rows.length === 0 ? (
        <div className="empty-row">No live records found.</div>
      ) : rows.map((row, index) => (
        <div className="table-row" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }} key={String(row.id || index)}>
          {columns.map((column) => <span key={String(column.key)}>{String(row[column.key] ?? "")}</span>)}
          {actions ? <div className="table-actions">{actions(row)}</div> : null}
        </div>
      ))}
    </div>
  );
}
