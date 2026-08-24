import type { ReactNode } from "react";

export function Callout({
  title,
  children,
  variant,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  variant?: "success" | "neutral";
  className?: string;
}) {
  const base = "rounded-xl border px-4 py-3 text-sm leading-relaxed";
  const tone =
    variant === "success"
      ? "border-success/30 bg-success/5 text-foreground/90"
      : "border-border bg-muted/40 text-foreground/85";

  return (
    <div className={`${base} ${tone} ${className ?? ""}`.trim()}>
      {title ? (
        <div className="font-semibold text-foreground mb-1">{title}</div>
      ) : null}
      <div className={title ? "opacity-90" : undefined}>{children}</div>
    </div>
  );
}

export function CalloutStep({
  step,
  children,
  className,
}: {
  step: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Callout
      title={`Step ${step}`}
      {...(className ? { className } : {})}
    >
      {children}
    </Callout>
  );
}
