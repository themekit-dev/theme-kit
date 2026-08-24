import type { ReactNode } from "react";

export function SectionHeading({
  num,
  desc,
  id,
  className,
  children,
}: {
  num?: number;
  desc?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={`mb-4 ${id ? "scroll-mt-24" : ""} ${className ?? ""}`.trim()}
    >
      <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5">
        {num !== undefined ? (
          <span
            className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-xs font-bold"
            style={{
              background: "var(--theme-color-primary)",
              color:
                "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
            }}
          >
            {num}
          </span>
        ) : null}
        {children}
      </h2>
      {desc ? (
        <div className="text-sm opacity-70 mt-1.5 leading-relaxed">{desc}</div>
      ) : null}
    </div>
  );
}
