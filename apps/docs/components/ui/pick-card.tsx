"use client";

import type { ReactNode } from "react";

/**
 * Selectable option card for "pick your X" rows in guides.
 *
 * Calm by design: a plain token-bordered card whose selected state is carried
 * by the primary border, a tinted background, and a check indicator — no
 * blur, shadow, or hover lift, so large grids stay quiet.
 */
export function PickCard({
  icon,
  title,
  subtitle,
  description,
  badge,
  active,
  onSelect,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  active: boolean;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`card-lift relative rounded-xl border p-4 flex flex-col items-start gap-2 text-left cursor-pointer ${
        active
          ? "border-(--theme-color-primary) bg-[color-mix(in_srgb,var(--theme-color-primary)_8%,transparent)]"
          : "border-border hover:border-(--theme-color-ring) hover:bg-muted/50"
      } ${className ?? ""}`}
    >
      {active ? (
        <span
          className="absolute top-3 right-3 w-5 h-5 grid place-items-center rounded-full text-[10px] font-bold"
          style={{
            background: "var(--theme-color-primary)",
            color:
              "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
          }}
          aria-hidden
        >
          ✓
        </span>
      ) : null}
      {badge && !active ? (
        <span
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: "var(--theme-color-primary)",
            color:
              "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
          }}
        >
          {badge}
        </span>
      ) : null}
      {icon ? <span className="text-2xl">{icon}</span> : null}
      <span className="font-semibold text-sm">{title}</span>
      {subtitle ? (
        <span className="mono text-[10px] opacity-40">{subtitle}</span>
      ) : null}
      {description ? (
        <span className="text-[11px] leading-snug opacity-60">
          {description}
        </span>
      ) : null}
    </button>
  );
}
