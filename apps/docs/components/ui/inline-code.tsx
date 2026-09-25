import type { ReactNode } from "react";

/**
 * Renders a plain-text description that uses `` `backticks` `` for inline code.
 *
 * The descriptions in `lib/frameworks.tsx`, `lib/packages.tsx`,
 * `lib/libraries.tsx` and `lib/framework-caveats.ts` are authored as plain
 * strings, so the backticks would otherwise be printed literally.
 */
export function InlineCode({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  if (typeof children !== "string" || !children.includes("`")) {
    return <>{children}</>;
  }

  const parts = children.split("`");

  return (
    <>
      {parts.map((part, index): ReactNode => {
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        }

        return (
          <code
            key={index}
            className={`mono text-[0.9em] ${className ?? ""}`.trim()}
          >
            {part}
          </code>
        );
      })}
    </>
  );
}
