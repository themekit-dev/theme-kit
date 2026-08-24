// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { createThemeRuntime, defineTheme } from "../src";

// Regression: createThemeRuntime's default BroadcastChannel must be closed on
// destroy(). Before the fix, the selection controller unsubscribed from the
// broadcast adapter but never closed the channel, leaving a live MessagePort
// that kept the Node event loop alive (process never exits after destroy).

function themes() {
  return [
    defineTheme({ name: "light", meta: { mode: "light" }, tokens: {} }),
    defineTheme({ name: "dark", meta: { mode: "dark" }, tokens: {} }),
  ];
}

describe("runtime destroy lifecycle — default BroadcastChannel", () => {
  const closeSpy = vi.fn();

  afterEach(() => {
    closeSpy.mockClear();
  });

  it("closes the default broadcast channel on destroy", () => {
    const originalClose = BroadcastChannel.prototype.close;
    BroadcastChannel.prototype.close = closeSpy;

    try {
      const runtime = createThemeRuntime({
        themes: themes(),
        defaultTheme: "light",
        initialMode: "light",
        dom: false,
        cssVariables: false,
      });

      // A default BroadcastChannel exists for cross-tab selection sync
      expect(BroadcastChannel.prototype.close).toBe(closeSpy);
      expect(closeSpy).not.toHaveBeenCalled();

      runtime.destroy();
      expect(closeSpy).toHaveBeenCalledTimes(1);
    } finally {
      BroadcastChannel.prototype.close = originalClose;
    }
  });

  it("destroy is safe when called twice", () => {
    const originalClose = BroadcastChannel.prototype.close;
    BroadcastChannel.prototype.close = closeSpy;

    try {
      const runtime = createThemeRuntime({
        themes: themes(),
        defaultTheme: "light",
        initialMode: "light",
        dom: false,
        cssVariables: false,
      });

      runtime.destroy();
      expect(() => runtime.destroy()).not.toThrow();
      expect(closeSpy).toHaveBeenCalledTimes(1);
    } finally {
      BroadcastChannel.prototype.close = originalClose;
    }
  });

  it("does not create a channel when broadcast is disabled", () => {
    const ctorSpy = vi.fn();
    const OriginalBroadcastChannel = globalThis.BroadcastChannel;
    const Fake = class extends OriginalBroadcastChannel {
      constructor(...args: unknown[]) {
        ctorSpy(...args);
        super(...(args as []));
      }
    };
    globalThis.BroadcastChannel = Fake as typeof BroadcastChannel;

    try {
      const runtime = createThemeRuntime({
        themes: themes(),
        defaultTheme: "light",
        initialMode: "light",
        broadcast: null,
        dom: false,
        cssVariables: false,
      });
      expect(ctorSpy).not.toHaveBeenCalled();
      runtime.destroy();
    } finally {
      globalThis.BroadcastChannel = OriginalBroadcastChannel;
    }
  });

  it("selection controller is a safe no-op after destroy", () => {
    const runtime = createThemeRuntime({
      themes: themes(),
      defaultTheme: "light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
    });

    runtime.destroy();
    // The default BroadcastChannel is now closed; these must not throw.
    expect(() => runtime.selection.setMode("dark")).not.toThrow();
    expect(() => runtime.selection.setFamily("default")).not.toThrow();
    expect(() => runtime.selection.toggleTheme()).not.toThrow();
  });
});
