import type { ThemeSelectionState } from "../model";
import type { ThemeSelectionBroadcastAdapter } from "./theme-selection";
import { createThemeSelectionBroadcast } from "./broadcast";
import { createSharedWorkerSync } from "./shared-worker";

export interface MultiWindowSyncOptions {
  channelName?: string;
  prefer?: "broadcast" | "sharedworker" | "auto";
  onFallback?: (strategy: string) => void;
}

/**
 * Sync theme selection across browser tabs/windows via BroadcastChannel
 *    (with a SharedWorker + storage fallback).
 */
export function createMultiWindowSync(
  options: MultiWindowSyncOptions = {},
): ThemeSelectionBroadcastAdapter {
  const prefer = options.prefer ?? "auto";

  if (prefer === "broadcast" || prefer === "auto") {
    const broadcast = createThemeSelectionBroadcast(
      options.channelName ? { channelName: options.channelName } : {},
    );
    if (broadcast) {
      return broadcast;
    }
    options.onFallback?.("BroadcastChannel unavailable");
  }

  if (prefer === "sharedworker" || prefer === "auto") {
    const worker = createSharedWorkerSync();
    if (worker) {
      return worker;
    }
    options.onFallback?.("SharedWorker unavailable");
  }

  return createNoopSync();
}

export function createNoopSync(): ThemeSelectionBroadcastAdapter {
  return {
    post() {},
    subscribe() {
      return () => {};
    },
    destroy() {},
  };
}

export function createStorageEventSync(
  key = "theme-selection-state",
  view: Window | undefined = typeof window !== "undefined" ? window : undefined,
): ThemeSelectionBroadcastAdapter {
  if (!view) {
    return createNoopSync();
  }

  return {
    post(value) {
      try {
        view!.localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },

    subscribe(listener) {
      const handler = (event: StorageEvent) => {
        if (event.key !== key || !event.newValue) return;
        try {
          const parsed = JSON.parse(event.newValue) as ThemeSelectionState;
          if (parsed.mode && parsed.family) {
            listener(parsed);
          }
        } catch {}
      };
      view!.addEventListener("storage", handler);
      return () => view!.removeEventListener("storage", handler);
    },

    destroy() {
      try {
        view!.localStorage.removeItem(key);
      } catch {}
    },
  };
}
