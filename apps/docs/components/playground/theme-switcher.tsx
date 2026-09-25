"use client";

import { useMemo, useState } from "react";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
  useSetThemeMode,
} from "@theme-kit/next/client";
import { Icon } from "@iconify/react";
import { ModeToggle } from "../mode-toggle";
import { CopyButton } from "../ui/copy-button";

const modes = ["light", "dark", "system"] as const;

export function ThemeSwitcher() {
  const runtime = useThemeRuntime();
  const { family, mode, theme } = useTheme();
  const setFamily = useSetThemeFamily();
  const setMode = useSetThemeMode();

  const [shared, setShared] = useState(false);

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

  const config = useMemo(() => {
    return {
      theme: family,
      mode,
      timestamp: new Date().toISOString(),
    };
  }, [family, mode]);

  const shareConfig = () => {
    const data = JSON.stringify(config);
    try {
      const encoded = btoa(encodeURIComponent(data));
      const url = `${typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://theme-kit.vercel.app/playground"}?config=${encoded}`;
      navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      navigator.clipboard.writeText(data);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const randomizeTheme = () => {
    // Pick a random existing family so the switch actually applies
    if (families.length === 0) return;
    const randomFamily = families[Math.floor(Math.random() * families.length)];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    if (randomFamily) setFamily(randomFamily);
    if (randomMode) setMode(randomMode);
  };

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      aria-label="Theme controls"
    >
      {/* Control Rail */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={randomizeTheme}
          className="chip shrink-0 cursor-pointer hover:bg-muted transition-colors"
        >
          <Icon icon="lucide:shuffle" className="h-3.5 w-3.5" />
          Randomize
        </button>

        <CopyButton
          text={JSON.stringify(config, null, 2)}
          label="Copy config"
          className="shrink-0"
        />

        <button
          type="button"
          onClick={shareConfig}
          className="chip shrink-0 cursor-pointer hover:bg-muted transition-colors"
        >
          <Icon icon="lucide:share-2" className="h-3.5 w-3.5" />
          {shared ? "Link Copied!" : "Share"}
        </button>
      </div>

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
