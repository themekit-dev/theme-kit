"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useTheme,
  useThemeMode,
  useThemeFamily,
  useSetThemeMode,
  useSetThemeFamily,
} from "@theme-kit/next/client";

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

type SyncMethod = "BroadcastChannel" | "SharedWorker" | "StorageEvent" | "none";

const METHODS: { value: SyncMethod; label: string; desc: string }[] = [
  {
    value: "BroadcastChannel",
    label: "BroadcastChannel",
    desc: "Primary transport — instant, same-origin only.",
  },
  {
    value: "SharedWorker",
    label: "SharedWorker",
    desc: "Inline blob worker relay used when available.",
  },
  {
    value: "StorageEvent",
    label: "StorageEvent",
    desc: "localStorage fallback for older browsers.",
  },
];

export function SyncDemo() {
  const { theme } = useTheme();
  const mode = useThemeMode();
  const family = useThemeFamily();
  const setMode = useSetThemeMode();
  const setFamily = useSetThemeFamily();

  const [method, setMethod] = useState<SyncMethod>("none");
  const [remoteChanges, setRemoteChanges] = useState(0);
  const [lastRemote, setLastRemote] = useState<string | null>(null);
  const [flickerCount, setFlickerCount] = useState(0);
  const [simTab, setSimTab] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      setMethod("BroadcastChannel");
    } else if (typeof SharedWorker !== "undefined") {
      setMethod("SharedWorker");
    } else if (typeof window !== "undefined" && window.localStorage) {
      setMethod("StorageEvent");
    } else {
      setMethod("none");
    }
  }, []);

  useEffect(() => {
    if (method !== "BroadcastChannel") return;
    const channel = new BroadcastChannel("theme-selection");
    const handler = () => {
      setRemoteChanges((n) => n + 1);
      setLastRemote(formatTime(Date.now()));
    };
    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, [method]);

  function simulateRemote(next: "light" | "dark" | "system") {
    setSimTab(next);
    // A real second tab would send this over the channel; here we apply it
    // directly to the shared runtime (which also broadcasts to real tabs).
    setMode(next);
  }

  function openSecondTab() {
    const url = window.location.href;
    const win = window.open(url, "_blank", "width=1200,height=800");
    if (win) {
      setRemoteChanges((n) => n + 1);
      setFlickerCount((n) => n + 1);
    }
  }

  const methodInfo = useMemo(
    () => METHODS.find((m) => m.value === method),
    [method],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            method !== "none"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {method !== "none" ? "Syncing" : "Unavailable"}
        </span>
        <span className="text-sm opacity-70">
          Transport: <strong className="mono">{method}</strong>
        </span>
        <button
          type="button"
          onClick={openSecondTab}
          className="ml-auto px-3 py-1.5 rounded-lg border border-primary bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          Open a real second tab ↗
        </button>
      </div>

      {methodInfo && (
        <p className="m-0 text-xs opacity-60 -mt-2">{methodInfo.desc}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-50">
              This tab
            </span>
            <span className="text-[11px] mono opacity-40">live runtime</span>
          </div>
          <div className="p-4">
            <div className="text-sm mb-1">
              <span className="opacity-50">Theme: </span>
              <strong className="mono">{theme.name}</strong>
            </div>
            <div className="text-sm mb-4">
              <span className="opacity-50">Family / mode: </span>
              <strong className="mono">
                {family} / {mode}
              </strong>
            </div>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    mode === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden opacity-90">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-50">
              Other tab
            </span>
            <span className="text-[11px] mono opacity-40">simulated</span>
          </div>
          <div className="p-4">
            <p className="m-0 mb-4 text-xs opacity-60 leading-relaxed">
              Changes made here flow over the channel to every real tab open on
              this site — exactly what a second browser tab would do.
            </p>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => simulateRemote(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    simTab === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono">{remoteChanges}</span>
          <span className="text-[0.7em] opacity-50 text-center">
            remote changes
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono">{flickerCount}</span>
          <span className="text-[0.7em] opacity-50 text-center">
            windows opened
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono">
            {lastRemote ? (
              lastRemote
            ) : (
              <span className="text-base font-normal opacity-40">—</span>
            )}
          </span>
          <span className="text-[0.7em] opacity-50 text-center">last sync</span>
        </div>
      </div>

      <p className="m-0 text-sm opacity-70 leading-relaxed">
        {method !== "none"
          ? "Open this page in another tab and change the theme there — it re-themes this tab instantly. Transitions are suppressed on cross-tab applies so there’s zero flicker."
          : "No cross-tab sync method is available in this browser."}
      </p>
    </div>
  );
}
