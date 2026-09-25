import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

export type CalloutVariant =
  | "info"
  | "tip"
  | "warning"
  | "important"
  | "limitation"
  | "success"
  | "neutral";

const variantConfig: Record<
  CalloutVariant,
  {
    border: string;
    bg: string;
    text: string;
    icon?: string;
    iconColor?: string;
  }
> = {
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    text: "text-foreground/90",
    icon: "lucide:info",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  tip: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    text: "text-foreground/90",
    icon: "lucide:lightbulb",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-foreground/90",
    icon: "lucide:alert-triangle",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  important: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    text: "text-foreground/90",
    icon: "lucide:alert-circle",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  limitation: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    text: "text-foreground/90",
    icon: "lucide:octagon-alert",
    iconColor: "text-red-600 dark:text-red-400",
  },
  success: {
    border: "border-success/30",
    bg: "bg-success/5",
    text: "text-foreground/90",
    icon: "lucide:check-circle",
    iconColor: "text-success",
  },
  neutral: {
    border: "border-border",
    bg: "bg-muted/40",
    text: "text-foreground/85",
  },
};

export function Callout({
  title,
  children,
  variant = "neutral",
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  variant?: CalloutVariant;
  className?: string;
}) {
  const config = variantConfig[variant];
  const base = "rounded-xl border px-4 py-3 text-sm leading-relaxed";

  return (
    <div
      className={`${base} ${config.border} ${config.bg} ${config.text} ${className ?? ""}`.trim()}
    >
      {title || config.icon ? (
        <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
          {config.icon ? (
            <Icon
              icon={config.icon}
              className={`flex-shrink-0 ${config.iconColor ?? ""}`}
              width={16}
              height={16}
            />
          ) : null}
          {title ?? variant.charAt(0).toUpperCase() + variant.slice(1)}
        </div>
      ) : null}
      <div className={(title || config.icon) ? "opacity-90" : undefined}>
        {children}
      </div>
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
    <Callout title={`Step ${step}`} {...(className ? { className } : {})}>
      {children}
    </Callout>
  );
}
