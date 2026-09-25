import type { ReactNode } from "react";

interface CompatibilityTableColumn {
  key: string;
  label: string;
  width?: string;
  className?: string;
  render?: (value: any, row: any) => ReactNode;
}

interface CompatibilityTableProps {
  columns: CompatibilityTableColumn[];
  data: any[];
  className?: string;
}

export function CompatibilityTable({
  columns,
  data,
  className,
}: CompatibilityTableProps) {
  return (
    <div className={`overflow-x-auto ${className ?? ""}`}>
      <table className="w-full text-xs">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-3 py-2.5 font-medium ${
                  col.width ?? ""
                } ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-border hover:bg-muted/20 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3 ${col.className ?? ""}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "muted";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-muted/60 text-foreground",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    muted: "bg-muted/40 text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        variantClasses[variant]
      } ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
