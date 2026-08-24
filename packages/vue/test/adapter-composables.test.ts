import { describe, expect, it } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import {
  provideThemeRuntime,
  useShadcnTheme,
  useBootstrapTheme,
  useDaisyTheme,
  useOpenPropsTheme,
} from "../src/index";

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

function mountComposable(
  runtime: ReturnType<typeof createRuntime>,
  setup: () => unknown,
) {
  const Child = defineComponent({
    setup,
    render: () => h("div"),
  });
  const App = defineComponent({
    setup() {
      provideThemeRuntime(runtime);
      return () => h(Child);
    },
  });
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(App);
  app.mount(container);
  return { app, container };
}

describe("vue adapter composables", () => {
  it("useShadcnTheme installs the shadcn adapter on the runtime", () => {
    const runtime = createRuntime();
    const { app } = mountComposable(runtime, () => {
      useShadcnTheme();
    });
    expect(runtime.adapters.list().map((a) => a.id)).toContain("shadcn");
    app.unmount();
    expect(runtime.adapters.list().map((a) => a.id)).not.toContain("shadcn");
  });

  it("useBootstrapTheme installs the bootstrap adapter on the runtime", () => {
    const runtime = createRuntime();
    const { app } = mountComposable(runtime, () => {
      useBootstrapTheme();
    });
    expect(runtime.adapters.list().map((a) => a.id)).toContain("bootstrap");
    app.unmount();
    expect(runtime.adapters.list().map((a) => a.id)).not.toContain("bootstrap");
  });

  it("useDaisyTheme installs the daisyui adapter on the runtime", () => {
    const runtime = createRuntime();
    const { app } = mountComposable(runtime, () => {
      useDaisyTheme();
    });
    expect(runtime.adapters.list().map((a) => a.id)).toContain("daisyui");
    app.unmount();
    expect(runtime.adapters.list().map((a) => a.id)).not.toContain("daisyui");
  });

  it("useOpenPropsTheme installs the open-props adapter on the runtime", () => {
    const runtime = createRuntime();
    const { app } = mountComposable(runtime, () => {
      useOpenPropsTheme();
    });
    expect(runtime.adapters.list().map((a) => a.id)).toContain("open-props");
    app.unmount();
    expect(runtime.adapters.list().map((a) => a.id)).not.toContain(
      "open-props",
    );
  });
});
