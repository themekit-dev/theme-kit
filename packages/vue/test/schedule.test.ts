import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createApp, defineComponent, h, nextTick } from "vue";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { provideThemeRuntime, useThemeSchedule } from "../src/index";

function createScheduledRuntime() {
  return createThemeRuntime({
    themes: [
      defineTheme({
        name: "light",
        meta: { family: "default", mode: "light" },
      }),
      defineTheme({
        name: "dark",
        meta: { family: "default", mode: "dark" },
      }),
    ],
    defaultTheme: "light",
    initialMode: "light",
    dom: false,
    cssVariables: false,
    persistence: null,
    scheduled: {
      lightTheme: "light",
      darkTheme: "dark",
      latitude: 40.7128,
      longitude: -74.006,
    },
  });
}

describe("vue useThemeSchedule", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes reactive schedule state and controls", async () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const runtime = createScheduledRuntime();

    let controller: ReturnType<typeof useThemeSchedule> | undefined;
    const Child = defineComponent({
      setup() {
        controller = useThemeSchedule();
        return () => h("div");
      },
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

    expect(controller?.schedule).not.toBeNull();
    expect(controller?.state.value.enabled).toBe(true);
    expect(controller?.state.value.status).toBe("active");
    expect(controller?.state.value.lightTheme).toBe("light");

    controller?.disable();
    await nextTick();
    expect(controller?.state.value.enabled).toBe(false);
    expect(controller?.state.value.status).toBe("disabled");

    controller?.enable();
    await nextTick();
    expect(controller?.state.value.enabled).toBe(true);
    expect(controller?.state.value.status).toBe("active");

    app.unmount();
    runtime.destroy();
    document.body.removeChild(container);
  });

  it("returns a schedule-less controller when not configured", () => {
    const runtime = createThemeRuntime({
      themes: [
        defineTheme({
          name: "light",
          meta: { family: "default", mode: "light" },
        }),
      ],
      defaultTheme: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    let controller: ReturnType<typeof useThemeSchedule> | undefined;
    const Child = defineComponent({
      setup() {
        controller = useThemeSchedule();
        return () => h("div");
      },
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

    expect(controller?.schedule).toBeNull();
    expect(controller?.state.value.enabled).toBe(false);
    expect(controller?.state.value.status).toBe("disabled");

    app.unmount();
    runtime.destroy();
    document.body.removeChild(container);
  });
});
