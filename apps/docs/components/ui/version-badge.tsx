import type { ReactNode } from "react";

export type VersionBadgeProps = {
  version: string;
  label?: string;
  className?: string;
};

export function VersionBadge({ version, label = "v", className }: VersionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-muted/50 border border-border ${className ?? ""}`.trim()}
    >
      <span className="opacity-60">{label}</span>
      <span className="font-semibold">{version}</span>
    </span>
  );
}

export type VerifiedBadgeProps = {
  version: string;
  date: string;
  className?: string;
};

export function VerifiedBadge({ version, date, className }: VerifiedBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-muted/30 border border-border ${className ?? ""}`.trim()}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 opacity-60"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <span className="opacity-80">
        Verified with Theme Kit <span className="font-mono font-semibold">{version}</span>
      </span>
      <span className="opacity-50">·</span>
      <span className="opacity-60">Updated {date}</span>
    </div>
  );
}
