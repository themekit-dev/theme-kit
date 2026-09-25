import type { ReactNode } from "react";
import Link from "next/link";

export type NextStepCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  className?: string;
};

export function NextStepCard({
  title,
  description,
  href,
  icon,
  className,
}: NextStepCardProps) {
  return (
    <Link
      href={href}
      className={`block rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors p-4 no-underline group ${className ?? ""}`.trim()}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="shrink-0 w-8 h-8 rounded-lg grid place-items-center text-sm"
            style={{
              background: "var(--theme-color-primary)",
              color:
                "var(--theme-color-primaryForeground)",
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-0.5 group-hover:underline">
            {title}
          </div>
          <div className="text-xs opacity-60 leading-relaxed">{description}</div>
        </div>
        <div
          className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--theme-color-primary)" }}
        >
          →
        </div>
      </div>
    </Link>
  );
}

export type NextStepsProps = {
  title?: string;
  steps: Array<Omit<NextStepCardProps, "className">>;
  className?: string;
};

export function NextSteps({ title = "Next steps", steps, className }: NextStepsProps) {
  return (
    <section className={className}>
      {title && (
        <h2 className="text-lg font-semibold tracking-tight mb-3">{title}</h2>
      )}
      <div className="flex flex-col gap-2">
        {steps.map((step, idx) => (
          <NextStepCard key={idx} {...step} />
        ))}
      </div>
    </section>
  );
}
