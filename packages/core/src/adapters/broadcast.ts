import type { ThemeMode, ThemeSelectionState } from "../model";
import type { ThemeSelectionBroadcastAdapter } from "./theme-selection";

export interface BroadcastChannelLike<T = unknown> {
  postMessage(message: T): void;
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<T>) => void,
  ): void;
  removeEventListener(
    type: "message",
    listener: (event: MessageEvent<T>) => void,
  ): void;
  close(): void;
}

export interface ThemeBroadcastAdapter {
  post(mode: ThemeMode): void;
  subscribe(listener: (mode: ThemeMode) => void): () => void;
  destroy(): void;
}

export interface ThemeBroadcastOptions {
  channel?: BroadcastChannelLike<ThemeMode>;
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

export interface ThemeSelectionBroadcastOptions {
  channelName?: string;
  channel?: BroadcastChannelLike<ThemeSelectionState>;
}

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
