import type { ThemeDefinition } from "../../model/theme";
import type { ThemeSelectionState } from "../../model/selection";
import type { ThemePlugin } from "../types";

/**
 * Options for {@link createBroadcastPlugin}.
 */
export interface BroadcastPluginOptions {
  /** Name of the `BroadcastChannel` used by the default adapter. Default
   *  `"theme-selection"`. */
  channelName?: string;
  /** Custom broadcast adapter. When omitted, a `BroadcastChannel`-based
   *  adapter is used when available; otherwise the plugin is inert. Pass
   *  `null` to disable broadcasting. */
  adapter?: {
    postMessage(message: ThemeSelectionState): void;
    onMessage(handler: (message: ThemeSelectionState) => void): () => void;
    destroy?(): void;
  } | null;
}

/**
 * Creates a plugin that synchronizes the theme selection across browser tabs
 * and windows.
 *
 * The plugin subscribes to incoming selection messages when the runtime is
 * created and applies the received mode/family to the runtime, and broadcasts
 * the selection after every persist. It uses a `BroadcastChannel`-based
 * adapter by default when available.
 *
 * @param options - Broadcast configuration.
 * @returns A `"broadcast"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createBroadcastPlugin({ channelName: "my-app-theme" }));
 * ```
 *
 * @remarks
 * `onDestroy` unsubscribes from incoming messages and closes the default
 * channel. When no adapter is available the plugin is inert.
 *
 * @see {@link BroadcastPluginOptions}
 */
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
