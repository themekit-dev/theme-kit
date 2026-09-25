import type { ThemeSelectionState } from "../model";
import type { ThemeSelectionBroadcastAdapter } from "./theme-selection";

function getWorkerScript(): string {
  return `
const ports = new Set();
self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  ports.add(port);
  port.addEventListener("message", (msg) => {
    for (const other of ports) {
      if (other !== port) {
        other.postMessage(msg.data);
      }
    }
  });
  port.addEventListener("close", () => {
    ports.delete(port);
  });
  port.start();
});
`;
}

let blobUrl: string | null = null;

function getSharedWorkerUrl(): string {
  if (blobUrl) return blobUrl;
  const blob = new Blob([getWorkerScript()], {
    type: "application/javascript",
  });
  blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

/**
 * Create a theme-selection broadcast adapter backed by a `SharedWorker`.
 *
 * The adapter relays theme selections between tabs/windows through a shared
 * worker, so every tab connected to the same worker receives the selection.
 * It requires `SharedWorker` support; when unavailable (or when the worker
 * cannot be created) it returns `null` (e.g. during SSR).
 *
 * @returns A `ThemeSelectionBroadcastAdapter`, or `null` when `SharedWorker`
 *   is unavailable.
 *
 * @example
 * ```ts
 * const sync = createSharedWorkerSync();
 * sync?.post({ mode: "dark", family: "plum" });
 * ```
 *
 * @see {@link destroySharedWorkerUrl}
 */
export function createSharedWorkerSync(): ThemeSelectionBroadcastAdapter | null {
  if (typeof SharedWorker === "undefined") return null;

  try {
    const url = getSharedWorkerUrl();
    const worker = new SharedWorker(url);
    const port = worker.port;
    port.start();

    return {
      post(value: ThemeSelectionState) {
        port.postMessage(value);
      },

      subscribe(listener: (value: ThemeSelectionState) => void) {
        const handler = (event: MessageEvent) => {
          listener(event.data as ThemeSelectionState);
        };
        port.addEventListener("message", handler);
        return () => port.removeEventListener("message", handler);
      },

      destroy() {
        port.close();
        worker.port.close();
      },
    };
  } catch {
    return null;
  }
}

/**
 * Release the shared worker's blob URL.
 *
 * Revokes the object URL created for the shared worker script and resets the
 * cached URL, so a subsequent {@link createSharedWorkerSync} call creates a
 * fresh worker. Safe to call multiple times; it is a no-op when no URL is
 * cached.
 */
export function destroySharedWorkerUrl(): void {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  }
}
