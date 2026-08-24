import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "../src";

describe("SSR runtime", () => {
  it("creates the runtime without window or document", () => {
    const runtime = createThemeRuntime({
      defaultTheme: "light",
      themes: [defineTheme({ name: "light" }), defineTheme({ name: "dark" })],
      lightTheme: "light",
      darkTheme: "dark",
      initialMode: "system",
    });

    expect(runtime.store.get().name).toBe("light");
    expect(runtime.selection.getMode()).toBe("system");

    runtime.destroy();
  });
});
