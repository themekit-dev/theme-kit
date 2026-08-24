"use client";

import { useMemo } from "react";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
  useSetThemeMode,
} from "@theme-kit/next/client";
import { ModeToggle } from "../mode-toggle";

const modes = ["light", "dark", "system"] as const;

export function ThemeSwitcher() {
  const runtime = useThemeRuntime();
  const { family, mode, theme } = useTheme();
  const setFamily = useSetThemeFamily();
  const setMode = useSetThemeMode();

  const families = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of runtime.themes) {
      const f = t.meta?.family;
      if (f && !seen.has(f)) {
        seen.add(f);
        result.push(f);
      }
    }
        return result.filter((f) => f !== "lab" && f !== "scope");
  }, [runtime.themes]);

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      aria-label="Theme controls"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-semibold mb-0.5">Live theme switcher</h2>
          <p className="text-xs opacity-60">
            Family controls the palette, mode controls light/dark/system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <span className="mono text-[11px] px-2.5 py-1 rounded-full border border-border opacity-80">
            {theme.name}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest opacity-40 mb-2">
          Family
        </div>
        <div className="flex flex-wrap gap-2">
          {families.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFamily(f)}
              className={`chip ${family === f ? "chip-active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest opacity-40 mb-2">
          Mode
        </div>
        <div className="flex gap-1.5">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`chip capitalize ${mode === m ? "chip-active" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
