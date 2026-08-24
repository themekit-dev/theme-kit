// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createThemeSelectionBroadcast,
  createNoopSync,
  createStorageEventSync,
  createMultiWindowSync,
} from "../src";

function mockNoBroadcastChannel() {
  const original = globalThis.BroadcastChannel;
  (globalThis as any).BroadcastChannel = undefined;
  return () => {
    (globalThis as any).BroadcastChannel = original;
  };
}

describe("createThemeSelectionBroadcast", () => {
  it("receives messages posted from another instance", async () => {
    const sender = createThemeSelectionBroadcast({
      channelName: "test-selection",
    });
    const receiver = createThemeSelectionBroadcast({
      channelName: "test-selection",
    });
    expect(sender).not.toBeNull();
    expect(receiver).not.toBeNull();
    if (!sender || !receiver) return;

    const listener = vi.fn();
    const unsubscribe = receiver.subscribe(listener);
    sender.post({ mode: "dark", family: "default" });

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith({
        mode: "dark",
        family: "default",
      });
    });

    unsubscribe();
    sender.destroy();
    receiver.destroy();
  });

  it("accepts a custom channel", () => {
    const postMessage = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const channel = {
      postMessage,
      addEventListener,
      removeEventListener,
      close: vi.fn(),
    };

    const adapter = createThemeSelectionBroadcast({ channel });
    expect(adapter).not.toBeNull();

    adapter!.post({ mode: "light", family: "test" });
    expect(postMessage).toHaveBeenCalledWith({ mode: "light", family: "test" });

    const listener = vi.fn();
    adapter!.subscribe(listener);
    const handler = addEventListener.mock.calls[0]?.[1];
    expect(handler).toBeDefined();

    adapter!.destroy();
    expect(channel.close).toHaveBeenCalled();
  });
});

describe("createNoopSync", () => {
  it("returns a no-op adapter that does nothing", () => {
    const adapter = createNoopSync();
    expect(() => {
      adapter.post({ mode: "light", family: "test" });
      const unsub = adapter.subscribe(() => {});
      unsub();
      adapter.destroy();
    }).not.toThrow();
  });
});

describe("createStorageEventSync", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("posts state via localStorage and receives via StorageEvent", () => {
    const adapter = createStorageEventSync("test-sync-key");
    const listener = vi.fn();
    adapter.subscribe(listener);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "test-sync-key",
        newValue: JSON.stringify({ mode: "dark", family: "ocean" }),
        storageArea: window.localStorage,
      }),
    );

    expect(listener).toHaveBeenCalledWith({
      mode: "dark",
      family: "ocean",
    });

    adapter.destroy();
  });

  it("ignores storage events for other keys", () => {
    const adapter = createStorageEventSync("my-key");
    const listener = vi.fn();
    adapter.subscribe(listener);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "other-key",
        newValue: JSON.stringify({ mode: "light", family: "forest" }),
      }),
    );

    expect(listener).not.toHaveBeenCalled();
    adapter.destroy();
  });
});

describe("createMultiWindowSync", () => {
  it("prefers BroadcastChannel when available", async () => {
    const sender = createMultiWindowSync({ channelName: "test-channel" });
    const receiver = createMultiWindowSync({ channelName: "test-channel" });
    expect(sender).not.toBeNull();
    expect(receiver).not.toBeNull();

    const listener = vi.fn();
    const unsubscribe = receiver.subscribe(listener);
    sender.post({ mode: "system", family: "default" });

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith({
        mode: "system",
        family: "default",
      });
    });

    unsubscribe();
    sender.destroy();
    receiver.destroy();
  });

  it("falls back to noop when BroadcastChannel and SharedWorker unavailable", () => {
    const restore = mockNoBroadcastChannel();
    const onFallback = vi.fn();
    const adapter = createMultiWindowSync({ onFallback });

    expect(onFallback).toHaveBeenCalledWith(
      expect.stringContaining("BroadcastChannel"),
    );
    expect(onFallback).toHaveBeenCalledWith(
      expect.stringContaining("SharedWorker"),
    );
    adapter.destroy();
    restore();
  });
});
