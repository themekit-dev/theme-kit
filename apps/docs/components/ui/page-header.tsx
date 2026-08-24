import type { ReactNode } from "react";
import { Badge } from "./badge";

export function PageHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  description,
  badges,
  actions,
}: {
  icon?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  badges?: { label: string; tone?: React.ComponentProps<typeof Badge>["tone"] }[];
  actions?: ReactNode;
}) {
  return (
    <header className="mb-10">
      <div className="flex items-start gap-4">
        {icon ? (
          <span
            className="w-12 h-12 shrink-0 rounded-xl grid place-items-center text-lg select-none"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-color-primary), color-mix(in srgb, var(--theme-color-primary) 40%, var(--theme-color-accent)))",
              color:
                "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
            }}
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest opacity-50">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {title}
          </h1>
          {subtitle ? (
            <p className="mono text-xs opacity-50 mt-1">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {badges && badges.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <Badge key={b.label} {...(b.tone ? { tone: b.tone } : {})}>
              {b.label}
            </Badge>
          ))}
        </div>
      ) : null}
      {description ? (
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-foreground/70 leading-relaxed">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
