"use client";

import { frameworks } from "../lib/frameworks";
import { useScrollToOnChange } from "./ui/use-scroll-to-on-change";

export function FrameworkPicker({
  value,
  onChange,
  label = "Pick your framework",
  scrollToId,
}: {
  value: string;
  onChange: (slug: string) => void;
  label?: string;
  scrollToId?: string;
}) {
  // Scroll after the framework change commits, so the target's position is
  // measured after any snippet-height changes above it have settled.
  useScrollToOnChange(scrollToId, value);

  return (
    <div className="mb-8">
      <span className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {frameworks.map((fw) => {
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