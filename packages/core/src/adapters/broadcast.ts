import type { ThemeMode, ThemeSelectionState } from "../model";
import type { ThemeSelectionBroadcastAdapter } from "./theme-selection";

/**
 * A minimal subset of the `BroadcastChannel` API used by the broadcast
 * adapters. Accepts any object with the same shape, enabling custom or
 * polyfilled channels.
 */
export interface BroadcastChannelLike<T = unknown> {
  /** Post a message to every other listener on the channel. */
  postMessage(message: T): void;
  /** Register a listener for incoming messages. */
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<T>) => void,
  ): void;
  /** Remove a previously registered message listener. */
  removeEventListener(
    type: "message",
    listener: (event: MessageEvent<T>) => void,
  ): void;
  /** Close the channel, releasing its resources. */
  close(): void;
}

/**
 * A contract for broadcasting and observing the selected theme mode across
 * tabs/windows. `subscribe` returns an unsubscribe function; `destroy`
 * releases the underlying channel.
 */
export interface ThemeBroadcastAdapter {
  /** Broadcast the given mode to other tabs/windows. */
  post(mode: ThemeMode): void;
  /** Subscribe to modes broadcast by other tabs/windows. Returns an
   *  unsubscribe function. */
  subscribe(listener: (mode: ThemeMode) => void): () => void;
  /** Close the underlying channel. */
  destroy(): void;
}

/**
 * Options for {@link createThemeBroadcast}.
 *
 * The adapter publishes the theme mode to a `BroadcastChannel` and applies
 * incoming modes from other tabs/windows.
 */
export interface ThemeBroadcastOptions {
  /** A custom channel to use. When omitted, a `BroadcastChannel` is created
   *  from `channelName`. */
  channel?: BroadcastChannelLike<ThemeMode>;
  /** Name of the `BroadcastChannel` created when `channel` is omitted.
   *  @defaultValue `"theme-mode"` */
  channelName?: string;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function isThemeSelectionState(value: unknown): value is ThemeSelectionState {
  return (
    typeof value === "object" &&
    value !== null &&
    "mode" in value &&
    "family" in value &&
    (value as ThemeSelectionState).mode !== undefined &&
    (value as ThemeSelectionState).family !== undefined
  );
}

/**
 * Create a theme-mode broadcast adapter backed by `BroadcastChannel`.
 *
 * The adapter publishes the mode to a channel and notifies subscribers of
 * modes broadcast by other tabs/windows. It requires `BroadcastChannel`
 * support (or a custom `channel`); when neither is available it returns
 * `null` (e.g. during SSR).
 *
 * @param options The broadcast configuration.
 * @returns A `ThemeBroadcastAdapter`, or `null` when no channel is available.
 *
 * @example
 * ```ts
 * const broadcast = createThemeBroadcast({ channelName: "my-theme-mode" });
 * broadcast?.post("dark");
 * ```
 *
 * @see {@link createStorageEventSync}
 * @see {@link ThemeSelectionBroadcastAdapter}
 */
export function createThemeBroadcast(
  options: ThemeBroadcastOptions = {},
): ThemeBroadcastAdapter | null {
  const channel =
    options.channel ??
    (typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(options.channelName ?? "theme-mode")
      : null);

  if (!channel) {
    return null;
  }

  return {
    post(mode) {
      channel.postMessage(mode);
    },

    subscribe(listener) {
      const handler = (event: MessageEvent<ThemeMode>) => {
        if (isThemeMode(event.data)) {
          listener(event.data);
        }
      };

      channel.addEventListener("message", handler);

      return () => {
        channel.removeEventListener("message", handler);
      };
    },

    destroy() {
      channel.close();
    },
  };
}

/**
 * Options for {@link createThemeSelectionBroadcast}.
 *
 * The adapter publishes the full theme selection (mode + family) to a
 * `BroadcastChannel` and applies incoming selections from other
 * tabs/windows.
 */
export interface ThemeSelectionBroadcastOptions {
  /** Name of the `BroadcastChannel` created when `channel` is omitted.
   *  @defaultValue `"theme-selection"` */
  channelName?: string;
  /** A custom channel to use. When omitted, a `BroadcastChannel` is created
   *  from `channelName`. */
  channel?: BroadcastChannelLike<ThemeSelectionState>;
}

/**
 * Create a broadcast adapter that publishes selection changes to other
 *    tabs/windows and applies incoming changes.
 */
export function createThemeSelectionBroadcast(
  options: ThemeSelectionBroadcastOptions = {},
): ThemeSelectionBroadcastAdapter | null {
  const channel =
    options.channel ??
    (typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(options.channelName ?? "theme-selection")
      : null);

  if (!channel) return null;

  return {
    post(value) {
      channel.postMessage(value);
    },

    subscribe(listener) {
      const handler = (event: MessageEvent<unknown>) => {
        if (isThemeSelectionState(event.data)) {
          listener(event.data);
        }
      };

      channel.addEventListener("message", handler);

      return () => {
        channel.removeEventListener("message", handler);
      };
    },

    destroy() {
      channel.close();
    },
  };
}
