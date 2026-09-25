import { createThemeRuntime, defineTheme } from "@theme-kit/core";

const oceanLight = defineTheme({
  name: "ocean-light",
  meta: { family: "ocean", mode: "light" },
  tokens: { colors: { background: "#f0f9ff", foreground: "#0c1e2e" } },
});

const oceanDark = defineTheme({
  name: "ocean-dark",
  meta: { family: "ocean", mode: "dark" },
  tokens: { colors: { background: "#082f49", foreground: "#e0f2fe" } },
});

/**
 * `createThemeRuntime` is the single entry point for theming. In a browser it
 * also installs the DOM + CSS-variable bindings; `dom: false` and
 * `cssVariables: false` keep this example headless so it runs under Node.
 */
const runtime = createThemeRuntime({
  themes: [oceanLight, oceanDark],
  defaultTheme: "ocean-light",
  initialMode: "light",
  dom: false,
  cssVariables: false,
  persistence: null,
  broadcast: null,
});

console.log("active theme:", runtime.store.get().name);

runtime.selection.setMode("dark");
console.log('after setMode("dark"):', runtime.store.get().name);

runtime.selection.setFamily("ocean");
console.log("selection:", runtime.selection.getSelection());

// A runtime owns resources (bindings, timers, listeners): always destroy it
// when the owning application lifecycle ends.
runtime.destroy();
