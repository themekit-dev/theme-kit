"use client";

import { frameworks } from "../lib/frameworks";
import { useScrollToOnChange } from "./ui/use-scroll-to-on-change";

export function FrameworkPicker({
  value,
  onChange,
  label = "Pick your framework",
  scrollToId,
  includeCssOnly = false,
}: {
  value: string;
  onChange: (slug: string) => void;
  label?: string;
  scrollToId?: string;
  /**
   * Include CSS-only integrations (Tailwind, UnoCSS). Off by default: this
   * picker answers "which framework are you using?", and a CSS-only package has
   * no provider to mount, so offering it here reads as a category error.
   */
  includeCssOnly?: boolean;
}) {
  // Scroll after the framework change commits, so the target's position is
  // measured after any snippet-height changes above it have settled.
  useScrollToOnChange(scrollToId, value);

  const options = includeCssOnly
    ? frameworks
    : frameworks.filter((fw) => !fw.cssOnly);

  return (
    <div className="mb-8">
      <span className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((fw) => {
          const active = value === fw.slug;
          return (
            <button
              key={fw.slug}
              type="button"
              className={`chip ${active ? "chip-active" : ""}`}
              onClick={() => onChange(fw.slug)}
              aria-pressed={active}
            >
              {fw.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getExample<T>(
  map: Record<string, T>,
  slug: string,
): T {
  return map[slug] ?? Object.values(map)[0]!;
}