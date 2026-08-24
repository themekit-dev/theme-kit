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

export function destroySharedWorkerUrl(): void {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  }
}
