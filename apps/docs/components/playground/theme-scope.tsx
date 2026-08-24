"use client";

import React from "react";
import { ThemeScope as ScopedTheme } from "@theme-kit/next/client";

const ThemeScope = () => {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Theme controls">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-semibold mb-0.5">Theme Scope</h2>
          <p className="text-xs opacity-60">
            Sandbox any subtree with its own theme — independent of the global runtime.
          </p>
        </div>
        <span className="mono text-[11px] px-2.5 py-1 rounded-full border border-border opacity-80">
          scoped
        </span>
      </div>

      <div>
        <h2 className="text-base font-semibold m-0">Component-Scoped Themes</h2>
        <p className="mt-1 mb-0 text-sm opacity-70">
          Each card below uses a different scoped theme, independent of the
          global theme.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mt-3">
          <ScopedTheme theme="slack-dark">
            <div className="p-4 border border-border rounded-(--theme-radius-lg) bg-card text-card-foreground">
              <strong>Slack Dark (scoped)</strong>
              <p className="mt-2 text-xs">
                This card always uses the forest color palette regardless of the
                global theme.
              </p>
            </div>
          </ScopedTheme>

          <ScopedTheme theme="plum-dark">
            <div className="p-4 border border-border rounded-(--theme-radius-lg) bg-card text-card-foreground">
              <strong>Plum Dark (scoped)</strong>
              <p className="mt-2 text-xs">
                This card always uses the plum color palette regardless of the
                global theme.
              </p>
            </div>
          </ScopedTheme>

          <div className="p-4 border border-border rounded-(--theme-radius-lg) bg-card text-card-foreground opacity-70">
            <strong>Global Theme (no scope)</strong>
            <p className="mt-2 text-xs">
              This card follows the global theme and changes when you toggle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThemeScope;
