import type { ReactNode } from "react";

export type SupportLevel = "stable" | "experimental" | "limited" | "partial" | "yes" | "no";

const supportStyles: Record<SupportLevel, { bg: string; text: string; border: string }> = {
  stable: {
    bg: "bg-[color-mix(in_srgb,var(--theme-color-success)_10%,transparent)]",
    text: "text-[var(--theme-color-success)]",
    border: "border-[color-mix(in_srgb,var(--theme-color-success)_20%,transparent)]",
  },
  yes: {
    bg: "bg-[color-mix(in_srgb,var(--theme-color-success)_10%,transparent)]",
    text: "text-[var(--theme-color-success)]",
    border: "border-[color-mix(in_srgb,var(--theme-color-success)_20%,transparent)]",
  },
  experimental: {
    bg: "bg-[color-mix(in_srgb,var(--theme-color-warning,#f59e0b)_10%,transparent)]",
    text: "text-[var(--theme-color-warning,#f59e0b)]",
    border: "border-[color-mix(in_srgb,var(--theme-color-warning,#f59e0b)_20%,transparent)]",
  },
  partial: {
    bg: "bg-[color-mix(in_srgb,var(--theme-color-warning,#f59e0b)_10%,transparent)]",
    text: "text-[var(--theme-color-warning,#f59e0b)]",
    border: "border-[color-mix(in_srgb,var(--theme-color-warning,#f59e0b)_20%,transparent)]",
  },
  limited: {
    bg: "bg-muted/50",
    text: "opacity-70",
    border: "border-border",
  },
  no: {
    bg: "bg-muted/30",
    text: "opacity-50",
    border: "border-border",
  },
};

const supportLabels: Record<SupportLevel, string> = {
  stable: "Stable",
  experimental: "Experimental",
  limited: "Limited",
  partial: "Partial",
  yes: "Yes",
  no: "No",
};

export type SupportBadgeProps = {
  level: SupportLevel;
  label?: string;
  className?: string;
};

export function SupportBadge({ level, label, className }: SupportBadgeProps) {
  const styles = supportStyles[level];
  const displayLabel = label ?? supportLabels[level];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border} ${className ?? ""}`.trim()}
    >
      {displayLabel}
    </span>
  );
}

export type FeatureSupportProps = {
  ssr?: SupportLevel;
  zeroFlash?: SupportLevel;
  persistence?: SupportLevel;
  className?: string;
};

export function FeatureSupport({
  ssr,
  zeroFlash,
  persistence,
  className,
}: FeatureSupportProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`.trim()}>
      {ssr && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs opacity-60">SSR:</span>
          <SupportBadge level={ssr} />
        </div>
      )}
      {zeroFlash && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs opacity-60">Zero-flash:</span>
          <SupportBadge level={zeroFlash} />
        </div>
      )}
      {persistence && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs opacity-60">Persistence:</span>
          <SupportBadge level={persistence} />
        </div>
      )}
    </div>
  );
}
