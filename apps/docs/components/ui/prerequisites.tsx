import type { ReactNode } from "react";
import Link from "next/link";

export type PrerequisiteItem = {
  label: string;
  value: string | ReactNode;
  href?: string;
};

export type PrerequisitesProps = {
  items: PrerequisiteItem[];
  className?: string;
};

export function Prerequisites({ items, className }: PrerequisitesProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-muted/20 overflow-hidden mb-10 ${className ?? ""}`.trim()}
    >
      <div className="px-4 py-2 border-b border-border bg-muted/40">
        <div className="text-xs font-semibold uppercase tracking-wider opacity-50">
          Prerequisites
        </div>
      </div>
      <div className="divide-y divide-border">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="px-4 py-3 grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-3"
          >
            <div className="text-xs font-semibold opacity-70">{item.label}</div>
            <div className="text-sm">
              {item.href ? (
                <Link href={item.href} className="underline hover:no-underline">
                  {item.value}
                </Link>
              ) : (
                item.value
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
