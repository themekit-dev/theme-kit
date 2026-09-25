"use client";

/**
 * Shared primitives for the showcase compositions.
 *
 * These exist so every scene is built from the same product-grade vocabulary —
 * a real app shell, real charts, real table rows — instead of each one inventing
 * its own approximations. A gallery is only convincing if the mock interfaces
 * look like software someone actually shipped.
 *
 * Rules that hold throughout:
 *  - **Tokens only.** Every surface, border and text color comes from a Theme
 *    Kit token utility (`bg-card`, `text-muted-foreground`, `border-border`, …),
 *    so switching family restyles everything. The only hardcoded colors are
 *    semantic status hues (success / warning / danger), which are not part of a
 *    theme's identity.
 *  - **Deterministic.** No `Math.random()`, no `Date.now()` in render — a random
 *    value differs between the server and client render and produces a hydration
 *    mismatch.
 *  - **No real headings.** Mock UI uses `<div>`, never `<h1>`–`<h6>`: a heading
 *    here would land in the page's outline, and would become a genuine heading
 *    once the immersive view drops the `aria-hidden` wrapper.
 */

import { useId } from "react";
import { Icon } from "@iconify/react";

/** Every composition accepts the same props, so the gallery can drive them uniformly. */
export type CompositionProps = {
  /**
   * Render the browser-like frame (traffic lights + URL strip). The gallery shows
   * it on the featured piece and in the immersive view only — repeating it on
   * six cards makes a gallery read as six screenshots.
   */
  chrome?: boolean;
};

/* ------------------------------------------------------------- app shell */

/**
 * The browser-ish frame. `chrome` is false in gallery cards — repeating a
 * traffic-light bar six times makes a gallery read as six screenshots.
 */
export function Frame({
  title,
  children,
  chrome = true,
  toolbar,
}: {
  title: string;
  children: React.ReactNode;
  chrome?: boolean;
  toolbar?: React.ReactNode;
}) {
  return (
    <div className="h-full w-full bg-background text-foreground flex flex-col">
      {chrome ? (
        <div className="h-9 shrink-0 flex items-center gap-3 px-3 border-b border-border bg-card">
          <div className="flex gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 max-w-72">
              <Icon
                icon="ph:lock-simple"
                width={9}
                height={9}
                className="text-muted-foreground shrink-0"
              />
              <span className="text-[10px] text-muted-foreground truncate">{title}</span>
            </div>
          </div>
          {toolbar ?? <div className="w-10" />}
        </div>
      ) : null}
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** Global top bar: workspace, search, notifications, avatar. */
export function TopBar({
  workspace = "Acme Inc",
  searchHint = "Search…",
  right,
}: {
  workspace?: string;
  searchHint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="h-11 shrink-0 flex items-center gap-3 px-3 border-b border-border bg-card">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-5 h-5 rounded-md bg-primary" aria-hidden />
        <span className="text-[11px] font-semibold truncate max-w-28">{workspace}</span>
        <Icon icon="ph:caret-up-down" width={9} height={9} className="text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 hidden sm:flex justify-center">
        <div className="flex items-center gap-2 w-full max-w-64 rounded-md border border-border bg-background px-2 py-1">
          <Icon icon="ph:magnifying-glass" width={11} height={11} className="text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground flex-1 truncate">{searchHint}</span>
          <span className="text-[9px] text-muted-foreground border border-border rounded px-1 shrink-0">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        {right}
        <span className="relative w-6 h-6 grid place-items-center rounded-md text-muted-foreground">
          <Icon icon="ph:bell" width={13} height={13} />
          <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
        </span>
        <span className="w-6 h-6 grid place-items-center rounded-md text-muted-foreground">
          <Icon icon="ph:question" width={13} height={13} />
        </span>
        <Avatar label="A" />
      </div>
    </div>
  );
}

/** Sidebar with grouped navigation, counts, an active rail and a user footer. */
export function SideNav({
  groups,
  active,
  footer,
  width = "w-44",
}: {
  groups: { label?: string; items: { label: string; icon: string; badge?: string }[] }[];
  active: string;
  footer?: React.ReactNode;
  width?: string;
}) {
  return (
    <aside className={`${width} shrink-0 border-r border-border bg-card flex flex-col`}>
      <nav className="flex-1 min-h-0 overflow-hidden px-2 py-2.5 space-y-3">
        {groups.map((g, gi) => (
          <div key={g.label ?? gi}>
            {g.label ? (
              <div className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </div>
            ) : null}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const isActive = item.label === active;
                return (
                  <div
                    key={item.label}
                    className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isActive ? (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary"
                        aria-hidden
                      />
                    ) : null}
                    <Icon icon={item.icon} width={12} height={12} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto text-[9px] rounded-full bg-muted px-1.5 py-px text-muted-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {footer ? (
        <div className="shrink-0 border-t border-border p-2">{footer}</div>
      ) : null}
    </aside>
  );
}

/* ----------------------------------------------------------------- atoms */

export function Avatar({
  label,
  tone = "primary",
  size = 6,
}: {
  label: string;
  tone?: "primary" | "muted";
  size?: number;
}) {
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-semibold shrink-0 ${
        tone === "primary"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, fontSize: `${size * 1.7}px` }}
      aria-hidden
    >
      {label}
    </span>
  );
}

export function AvatarStack({ labels, max = 4 }: { labels: string[]; max?: number }) {
  const shown = labels.slice(0, max);
  const rest = labels.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((l, i) => (
        <span
          key={l}
          className="-ml-1.5 first:ml-0 rounded-full ring-2 ring-card"
          style={{ zIndex: shown.length - i }}
        >
          <Avatar label={l} tone={i === 0 ? "primary" : "muted"} size={5} />
        </span>
      ))}
      {rest > 0 ? (
        <span className="-ml-1.5 grid place-items-center w-5 h-5 rounded-full bg-muted text-[9px] text-muted-foreground ring-2 ring-card">
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

const PILL_TONES = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function Pill({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: React.ReactNode;
  tone?: PillTone;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${PILL_TONES[tone]}`}
    >
      {dot ? <span className="w-1 h-1 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

const BTN_VARIANTS = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-foreground",
  outline: "border border-border bg-card text-foreground",
  ghost: "text-muted-foreground",
  danger: "bg-red-500 text-white",
} as const;

export function Btn({
  children,
  variant = "primary",
  icon,
  size = "sm",
}: {
  children?: React.ReactNode;
  variant?: keyof typeof BTN_VARIANTS;
  icon?: string;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium whitespace-nowrap ${
        size === "xs" ? "text-[10px] px-2 py-1" : "text-[11px] px-2.5 py-1.5"
      } ${BTN_VARIANTS[variant]}`}
    >
      {icon ? <Icon icon={icon} width={10} height={10} /> : null}
      {children}
    </span>
  );
}

/** A labelled control in a mock form. */
export function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex w-8 h-4.5 rounded-full p-0.5 shrink-0 ${
        on ? "bg-primary" : "bg-muted"
      }`}
      aria-hidden
    >
      <span
        className={`block w-3.5 h-3.5 rounded-full bg-background transition-transform ${
          on ? "translate-x-3.5" : ""
        }`}
      />
    </span>
  );
}

export function Field({
  label,
  value,
  hint,
  focused,
  invalid,
  icon,
}: {
  label?: string;
  value: string;
  hint?: string;
  focused?: boolean;
  invalid?: boolean;
  icon?: string;
}) {
  return (
    <div>
      {label ? (
        <div className="text-[10px] font-medium mb-1 text-foreground">{label}</div>
      ) : null}
      <div
        className={`flex items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 ${
          invalid
            ? "border-red-500/60"
            : focused
              ? "border-primary ring-2 ring-primary/20"
              : "border-border"
        }`}
      >
        {icon ? (
          <Icon icon={icon} width={11} height={11} className="text-muted-foreground shrink-0" />
        ) : null}
        <span
          className={`text-[11px] flex-1 truncate ${
            invalid ? "text-red-600 dark:text-red-400" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {focused ? <span className="w-px h-3 bg-primary" aria-hidden /> : null}
      </div>
      {hint ? (
        <div
          className={`text-[9px] mt-1 ${
            invalid ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          }`}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function Segmented({ options, active }: { options: string[]; active: number }) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-muted/50 p-0.5">
      {options.map((o, i) => (
        <span
          key={o}
          className={`text-[10px] px-2 py-0.5 rounded ${
            i === active
              ? "bg-card text-foreground font-medium shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {o}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- charts */

/** Area chart with gradient fill, grid lines and a highlighted point. */
export function AreaChart({
  data,
  height = 120,
  highlight,
}: {
  data: number[];
  height?: number;
  /** Index of the point to mark, as if hovered. */
  highlight?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const W = 100;
  const H = 40;
  const max = Math.max(...data) * 1.15;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      className="w-full block"
      aria-hidden
    >
      <defs>
        <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--theme-color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--theme-color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={W}
          y1={H * g}
          y2={H * g}
          stroke="var(--theme-color-border, currentColor)"
          strokeOpacity="0.35"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <path d={area} fill={`url(#fill-${uid})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--theme-color-primary)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {highlight !== undefined && data[highlight] !== undefined ? (
        <>
          <line
            x1={x(highlight)}
            x2={x(highlight)}
            y1="0"
            y2={H}
            stroke="var(--theme-color-primary)"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={x(highlight)}
            cy={y(data[highlight]!)}
            r="1.6"
            fill="var(--theme-color-primary)"
            stroke="var(--theme-color-background)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
    </svg>
  );
}

/** Vertical bars with a baseline and an optional emphasised column. */
export function BarChart({
  data,
  height = 96,
  labels,
  emphasise,
}: {
  data: number[];
  height?: number;
  labels?: string[];
  emphasise?: number;
}) {
  const max = Math.max(...data);
  return (
    <div style={{ height }} className="flex flex-col">
      <div className="flex-1 flex items-end gap-[3px]">
        {data.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-[2px] ${
              i === emphasise ? "bg-primary" : "bg-primary/35"
            }`}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      {labels ? (
        <div className="flex justify-between mt-1.5 text-[8px] text-muted-foreground">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Horizontal progress bar. */
export function Progress({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "success" | "warning";
}) {
  const tones = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  } as const;
  return (
    <span className="block h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <span
        className={`block h-full rounded-full ${tones[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </span>
  );
}

/** Donut built from segments — used for composition breakdowns. */
export function Donut({
  segments,
  size = 84,
  thickness = 10,
  center,
}: {
  segments: { value: number; className: string }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 50 - thickness / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--theme-color-muted, currentColor)"
          strokeOpacity="0.4"
          strokeWidth={thickness}
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              className={s.className}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {center ? (
        <div className="absolute inset-0 grid place-items-center">{center}</div>
      ) : null}
    </div>
  );
}

/** Inline sparkline for KPI cards. */
export function Sparkline({ data, className = "" }: { data: number[]; className?: string }) {
  const W = 100;
  const H = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="var(--theme-color-primary)"
        strokeWidth="1.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- layout */

/** Page header inside a scene: breadcrumb, title, description, actions. */
export function PageHead({
  breadcrumb,
  title,
  description,
  actions,
}: {
  breadcrumb?: string[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb ? (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            {breadcrumb.map((b, i) => (
              <span key={b} className="flex items-center gap-1">
                {i > 0 ? <Icon icon="ph:caret-right" width={8} height={8} /> : null}
                <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>{b}</span>
              </span>
            ))}
          </div>
        ) : null}
        <div className="text-[15px] font-semibold tracking-tight truncate">{title}</div>
        {description ? (
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-1.5 shrink-0">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-card ${pad ? "p-3" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="min-w-0">
        <div className="text-[11px] font-medium truncate">{title}</div>
        {hint ? <div className="text-[9px] text-muted-foreground truncate">{hint}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** KPI tile: label, big number, delta and an inline trend. */
export function Kpi({
  label,
  value,
  delta,
  up = true,
  trend,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  trend?: number[];
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {delta ? (
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] font-medium ${
              up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            <Icon icon={up ? "ph:trend-up" : "ph:trend-down"} width={9} height={9} />
            {delta}
          </span>
        ) : null}
      </div>
      <div className="text-[19px] font-semibold tabular-nums mt-1 leading-none">{value}</div>
      {trend ? <Sparkline data={trend} className="mt-2 h-5" /> : null}
    </Card>
  );
}

/* ----------------------------------------------------------------- table */

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-[11px] border-collapse">{children}</table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  sort,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  sort?: "asc" | "desc";
}) {
  return (
    <th
      className={`font-medium text-[9px] uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 bg-muted/50 border-b border-border whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sort ? (
          <Icon
            icon={sort === "asc" ? "ph:caret-up" : "ph:caret-down"}
            width={8}
            height={8}
            className="text-foreground"
          />
        ) : null}
      </span>
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`px-2.5 py-2 border-b border-border/60 last:border-b-0 ${
        align === "right" ? "text-right tabular-nums" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Avatar + name + secondary line, the standard first table cell. */
export function PersonCell({ name, meta }: { name: string; meta?: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar label={name.charAt(0)} tone="muted" size={5} />
      <div className="min-w-0">
        <div className="truncate text-[11px]">{name}</div>
        {meta ? <div className="truncate text-[9px] text-muted-foreground">{meta}</div> : null}
      </div>
    </div>
  );
}
