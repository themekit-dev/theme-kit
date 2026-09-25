// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { useDaisyTheme } from "../src/vue";

function createRuntime() {
  return createThemeRuntime({
    themes: [
      defineTheme({
        name: "light",
        meta: { family: "default", mode: "light" },
        tokens: {
          colors: {
            background: "#ffffff",
            foreground: "#0f172a",
            primary: "#d97706",
          },
        },
      }),
    ],
    initialMode: "light",
    dom: false,
    cssVariables: false,
    persistence: null,
  });
}

describe("useDaisyTheme (vue subpath)", () => {
  it("installs the daisyui adapter on the provided runtime and disposes it on unmount", () => {
    const runtime = createRuntime();
    const App = defineComponent({
      setup() {
        useDaisyTheme(runtime);
        return () => h("div");
      },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const app = createApp(App);
    app.mount(container);

    expect(runtime.adapters.list().map((a) => a.id)).toContain("daisyui");

    app.unmount();
    expect(runtime.adapters.list().map((a) => a.id)).not.toContain("daisyui");
  });
});
