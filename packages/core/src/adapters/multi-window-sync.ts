import type { ThemeSelectionState } from "../model";
import type { ThemeSelectionBroadcastAdapter } from "./theme-selection";
import { createThemeSelectionBroadcast } from "./broadcast";
import { createSharedWorkerSync } from "./shared-worker";

/**
 * Options for {@link createMultiWindowSync}.
 *
 * Controls which cross-tab synchronization strategy is preferred and how
 * fallbacks are reported.
 */
export interface MultiWindowSyncOptions {
  /** Name of the `BroadcastChannel` used when the broadcast strategy is
   *  selected. */
  channelName?: string;
  /** Preferred strategy. `"auto"` tries broadcast first, then shared worker.
   *  @defaultValue `"auto"` */
  prefer?: "broadcast" | "sharedworker" | "auto";
  /** Called with a description whenever a preferred strategy is unavailable
   *  and the sync falls back to the next one. */
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

/**
 * Create a no-op theme-selection sync adapter.
 *
 * Every method is a safe no-op: `post` discards the value, `subscribe`
 * returns an unsubscribe that does nothing, and `destroy` does nothing. Used
 * as the final fallback when no cross-tab strategy is available.
 *
 * @returns A `ThemeSelectionBroadcastAdapter` that performs no synchronization.
 */
export function createNoopSync(): ThemeSelectionBroadcastAdapter {
  return {
    post() {},
    subscribe() {
      return () => {};
    },
    destroy() {},
  };
}

/**
 * Create a theme-selection sync adapter backed by `localStorage` and the
 * `storage` event.
 *
 * The adapter writes the selection as JSON under a single key and notifies
 * subscribers of cross-tab changes through the `storage` event. It requires
 * a `Window`; when none is available it returns a no-op adapter (e.g. during
 * SSR).
 *
 * @param key Storage key used for the selection.
 *   @defaultValue `"theme-selection-state"`
 * @param view The `Window` used to access storage and listen for `storage`
 *   events. Defaults to the global `window` when present.
 * @returns A `ThemeSelectionBroadcastAdapter`.
 *
 * @example
 * ```ts
 * const sync = createStorageEventSync();
 * sync.post({ mode: "dark", family: "plum" });
 * ```
 *
 * @see {@link createThemeBroadcast}
 * @see {@link MultiWindowSyncOptions}
 */
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
