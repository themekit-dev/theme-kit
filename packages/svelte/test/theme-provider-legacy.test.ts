import { describe, it, expect, afterAll, vi } from "vitest";
import { compile } from "svelte/compiler";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mount, unmount, flushSync } from "svelte";
import { createThemeRuntime, type ThemeDefinition } from "@theme-kit/core";

const themes: ThemeDefinition[] = [
  {
    name: "forest-light",
    meta: { family: "forest", mode: "light" },
    tokens: { colors: { background: "#f0fff0", card: "#ffffff" } },
  },
  {
    name: "forest-dark",
    meta: { family: "forest", mode: "dark" },
    tokens: { colors: { background: "#002200", card: "#003300" } },
  },
];

/**
 * Legacy consumer with NO script calls to imported functions and NO external
 * runtime — the component has no `needs_context`, so the Svelte compiler does
 * NOT emit `$.init()`. This is the exact scenario that broke ThemeProvider:
 * the DOM/CSS bindings were created inside `onMount`, which never flushed
 * without `$.init()`.
 */
const noScriptCallsSource = `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  export let themes = [];
  export let defaultTheme = "forest-dark";
</script>

<ThemeProvider {themes} {defaultTheme}>
  <p id="works">works</p>
</ThemeProvider>
`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(__dirname, ".generated");

async function buildConsumer(source: string, name: string) {
  mkdirSync(generatedDir, { recursive: true });
  const { js } = compile(source, { filename: `${name}.svelte`, runes: false });
  const outFile = join(
    generatedDir,
    `${name}.${Date.now()}.${Math.random().toString(36).slice(2)}.mjs`,
  );
  writeFileSync(outFile, js.code);
  return import(outFile.replace(/\\/g, "/"));
}

afterAll(() => {
  rmSync(generatedDir, { recursive: true, force: true });
});

describe("ThemeProvider in legacy mode without needs_context", () => {
  it("applies DOM attributes and CSS variables to the document root synchronously", async () => {
    const mod = await buildConsumer(noScriptCallsSource, "NoScriptCallsApp");

    // Clean any previous side-effects on <html> from other tests
    const html = document.documentElement;
    html.removeAttribute("data-theme");
    html.removeAttribute("data-theme-mode");
    html.removeAttribute("data-theme-family");
    html.className = "";
    html.style.cssText = "";

    const target = document.createElement("div");
    document.body.appendChild(target);

    const instance = mount(mod.default, {
      target,
      props: { themes, defaultTheme: "forest-dark" },
    });

    flushSync();

    // --- The critical assertions that failed before the fix ---
    // The provider must apply its bindings to the document root even when
    // the parent component has no `$.init()` (no `needs_context`).
    expect(html.getAttribute("data-theme")).toBe("forest-dark");
    expect(html.getAttribute("data-theme-mode")).toBe("dark");
    expect(html.getAttribute("data-theme-family")).toBe("forest");
    expect(html.classList.contains("dark")).toBe(true);

    // CSS variables must be applied to the document root
    const computed = getComputedStyle(html);
    expect(computed.getPropertyValue("--theme-color-background").trim()).toBe(
      "#002200",
    );
    expect(computed.getPropertyValue("--theme-color-card").trim()).toBe(
      "#003300",
    );

    // Children rendered correctly
    expect(target.querySelector("#works")?.textContent).toBe("works");

    // ---- Toggle still works via the store ----
    // Simulate a theme toggle by directly accessing the context
    // (The ThemeProvider exposes no runtime prop, so we check the DOM
    //  after interaction via the button/app — but since there's no
    //  toggle button in this test, we can verify the initial state is
    //  correct, which is the core fix.)

    unmount(instance);
    flushSync();
    document.body.removeChild(target);
  });

  it("applies light theme via defaultTheme and initialMode props", async () => {
    const source = `<script>
      import { ThemeProvider } from "@theme-kit/svelte";
      export let themes = [];
    </script>

    <ThemeProvider {themes} defaultTheme="forest-light" initialMode="light">
      <p id="works">light</p>
    </ThemeProvider>
    `;

    const mod = await buildConsumer(source, "LightApp");

    const html = document.documentElement;
    html.removeAttribute("data-theme");
    html.removeAttribute("data-theme-mode");
    html.removeAttribute("data-theme-family");
    html.className = "";
    html.style.cssText = "";

    const target = document.createElement("div");
    document.body.appendChild(target);

    const instance = mount(mod.default, {
      target,
      props: { themes },
    });

    flushSync();

    expect(html.getAttribute("data-theme")).toBe("forest-light");
    expect(html.getAttribute("data-theme-mode")).toBe("light");
    expect(html.classList.contains("dark")).toBe(false);

    const computed = getComputedStyle(html);
    expect(computed.getPropertyValue("--theme-color-background").trim()).toBe(
      "#f0fff0",
    );

    unmount(instance);
    flushSync();
    document.body.removeChild(target);
  });
});