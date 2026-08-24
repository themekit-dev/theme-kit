import { describe, it, expect, vi } from "vitest";
import { render } from "solid-js/web";
import { createComponent } from "solid-js";
import { ThemeProvider, ThemeScope } from "@theme-kit/solid";
import { createThemeRuntime, type ThemeDefinition } from "@theme-kit/core";

const themes: ThemeDefinition[] = [
  { name: "forest-light", meta: { family: "forest", mode: "light" }, tokens: { colors: { background: "#f0fff0", card: "#ffffff" } } },
  { name: "forest-dark", meta: { family: "forest", mode: "dark" }, tokens: { colors: { background: "#002200", card: "#003300" } } },
  { name: "ocean-light", meta: { family: "ocean", mode: "light" }, tokens: { colors: { background: "#f0f0ff", card: "#ffffff" } } },
  { name: "ocean-dark", meta: { family: "ocean", mode: "dark" }, tokens: { colors: { background: "#00002f", card: "#0a0a50" } } },
];

function p(id: string, text: string) {
  return () => {
    const el = document.createElement("p");
    el.id = id;
    el.textContent = text;
    return el;
  };
}

function scopeBox(host: HTMLElement, dataTheme: string) {
  return Array.from(host.querySelectorAll("div")).find(
    (el) => el.getAttribute("data-theme") === dataTheme,
  ) as HTMLElement | undefined;
}

describe("solid ThemeScope", () => {
  it("scopes locally without mutating the global store", () => {
    const runtime = createThemeRuntime({ themes, dom: false, cssVariables: false } as any);
    const spy = vi.fn();
    runtime.store.subscribe(spy);
    const host = document.createElement("div");
    document.body.appendChild(host);
    const dispose = render(
      () =>
        createComponent(ThemeProvider, {
          runtime,
          themes,
          children: () =>
            createComponent(ThemeScope, {
              theme: "forest-dark",
              className: "scoped-box",
              "data-testid": "scope",
              children: p("scoped-text", "scoped"),
            }),
        }),
      host,
    );

    expect(host.querySelector("#scoped-text")?.textContent).toBe("scoped");
    const scope = host.querySelector('[data-testid="scope"]') as HTMLElement;
    expect(scope).toBeTruthy();
    expect(scope.classList.contains("scoped-box")).toBe(true);
    expect(scope.getAttribute("data-theme")).toBe("forest-dark");
    expect(scope.style.getPropertyValue("--theme-color-background")).toBe("#002200");
    expect(spy).not.toHaveBeenCalled();

    dispose();
    runtime.destroy();
    document.body.removeChild(host);
  });

  it("family scopes follow a global mode flip", () => {
    const runtime = createThemeRuntime({ themes, dom: false, cssVariables: false } as any);
    const host = document.createElement("div");
    document.body.appendChild(host);
    const dispose = render(
      () =>
        createComponent(ThemeProvider, {
          runtime,
          themes,
          children: () =>
            createComponent(ThemeScope, {
              family: "ocean",
              children: p("ocean-text", "ocean"),
            }),
        }),
      host,
    );

    const oceanLight = scopeBox(host, "ocean-light");
    expect(oceanLight).toBeTruthy();
    expect(oceanLight!.style.getPropertyValue("--theme-color-background")).toBe("#f0f0ff");

    runtime.selection.setMode("dark");

    const oceanDark = scopeBox(host, "ocean-dark");
    expect(oceanDark).toBeTruthy();
    expect(oceanDark!.style.getPropertyValue("--theme-color-background")).toBe("#00002f");
    expect(host.querySelector("#ocean-text")?.textContent).toBe("ocean");

    dispose();
    runtime.destroy();
    document.body.removeChild(host);
  });
});