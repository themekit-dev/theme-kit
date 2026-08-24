import type { ThemeDefinition } from "../../model/theme";
import type { ThemeSelectionState } from "../../model/selection";
import type { ThemePlugin } from "../types";

export interface BroadcastPluginOptions {
  channelName?: string;
  adapter?: {
    postMessage(message: ThemeSelectionState): void;
    onMessage(handler: (message: ThemeSelectionState) => void): () => void;
    destroy?(): void;
  } | null;
}

export function createBroadcastPlugin<T extends ThemeDefinition>(
  options?: BroadcastPluginOptions,
): ThemePlugin<T> {
  const channelName = options?.channelName ?? "theme-selection";

  let adapter: BroadcastPluginOptions["adapter"] = options?.adapter;

  if (adapter === undefined) {
    if (typeof BroadcastChannel === "undefined") {
      adapter = null;
    } else {
      const channel = new BroadcastChannel(channelName);
      adapter = {
        postMessage(message) {
          channel.postMessage(message);
        },
        onMessage(handler) {
          const listener = (event: MessageEvent) => handler(event.data);
          channel.addEventListener("message", listener);
          return () => channel.removeEventListener("message", listener);
        },
        destroy() {
          channel.close();
        },
      };
    }
  }

  let unsubscribe: (() => void) | null = null;

  return {
    name: "broadcast",
    version: "1.0.0",
    priority: 90,

    onRuntimeCreated(runtime) {
      if (!adapter) return;

      unsubscribe = adapter.onMessage((message) => {
        if (message.mode) runtime.selection.setMode(message.mode);
        if (message.family) runtime.selection.setFamily(message.family);
      });
    },

    onAfterPersist({ selection }) {
      adapter?.postMessage(selection);
    },

    onDestroy() {
      unsubscribe?.();
      unsubscribe = null;
      adapter?.destroy?.();
      adapter = undefined;
    },
  };
}
