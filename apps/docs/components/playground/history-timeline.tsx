"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useThemeHistory,
  useThemeTimeTravel,
  useThemeValue,
} from "@theme-kit/next/client";

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function HistoryTimeline() {
  const current = useThemeValue();
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  const { history, jump } = useThemeTimeTravel();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentIndex = useMemo(
    () => history.findIndex((entry) => entry.theme.name === current.name),
    [history, current.name],
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Theme history">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold">History &amp; time travel</h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => undo()}
            disabled={!canUndo}
            className="btn btn-ghost px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => redo()}
            disabled={!canRedo}
            className="btn btn-ghost px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Redo
          </button>
        </div>
      </div>
      <p className="text-xs opacity-60 mb-4">
        Every theme change is recorded as a snapshot. Click any entry to jump
        to that point in time.
      </p>

      <div className="rounded-xl border border-border max-h-64 overflow-auto">
        {history.length === 0 ? (
          <p className="p-4 text-sm opacity-50">
            No history yet — switch a theme above to begin.
          </p>
        ) : (
          <ol className="py-2">
            {history.map((entry, index) => {
              const isCurrent = index === currentIndex;
              return (
                <li key={`${entry.timestamp}-${index}`} className="px-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => jump(index)}
                    disabled={isCurrent}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm cursor-pointer transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="mono text-[10px] opacity-50 shrink-0">
                      {String(index).padStart(2, "0")}
                    </span>
                    <span className="font-medium truncate">{entry.theme.name}</span>
                    {mounted && (
                      <span className="mono text-[10px] opacity-50 shrink-0 ml-auto">
                        {formatTime(entry.timestamp)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <p className="mt-3 text-[11px] opacity-50">
        {history.length} snapshot{history.length === 1 ? "" : "s"} · capped at
        50 · <span className="mono">{current.name}</span> is current
      </p>
    </section>
  );
}
