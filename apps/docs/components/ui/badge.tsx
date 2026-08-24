import type { ReactNode } from "react";

type Tone = "accent" | "neutral" | "success";

const tones: Record<Tone, string> = {
  accent: "badge-accent",
  neutral: "badge-neutral",
  success: "badge-success",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`badge ${tones[tone]} ${className ?? ""}`.trim()}>
      {children}
    </span>
  );
}

export type { Tone as BadgeTone };