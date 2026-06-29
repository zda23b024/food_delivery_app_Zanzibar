type Column<T> = {
  key: keyof T;
  label: string;
};

export function DataTable<T extends Record<string, string | number>>({ columns, rows }: { columns: Column<T>[]; rows: T[] }) {
  return (
    <div className="table-card">
      <div className="table-head" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((column) => <span key={String(column.key)}>{column.label}</span>)}
      </div>
      {rows.map((row, index) => (
        <div className="table-row" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }} key={String(row.id || index)}>
          {columns.map((column) => <span key={String(column.key)}>{row[column.key]}</span>)}
        </div>
      ))}
    </div>
  );
}
