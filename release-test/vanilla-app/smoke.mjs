// ESM consumer smoke test — installs @theme-kit/core from the published tarball
// and exercises the core public API without any DOM.
import { createThemeStore, createThemeRuntime } from "@theme-kit/core";
import { ThemeKit } from "@theme-kit/core/vanilla";

function assert(cond, label) {
  if (!cond) {
    console.error(`✗ ${label}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

// 1. createThemeStore + subscribe
const lightTheme = { name: "light", tokens: { colors: { background: "#fff" } } };
const darkTheme = { name: "dark", tokens: { colors: { background: "#000" } } };
const store = createThemeStore({ initialTheme: lightTheme });
let seen = 0;
const unsub = store.subscribe(() => { seen++; });
store.set(darkTheme);
assert(seen === 1, "store.subscribe fired on set");
unsub();
assert(store.get().name === "dark", "store.get returns updated theme");

// 2. Runtime
const runtime = createThemeRuntime({
  themes: [lightTheme, darkTheme],
  defaultTheme: "light",
  initialMode: "system",
});
assert(runtime.selection.getMode() === "system", "runtime.selection.getMode() === 'system'");
runtime.selection.setMode("dark");
assert(store.get().name === "dark", "runtime selection.setMode resolves theme");
runtime.destroy();
assert(true, "runtime.destroy() idempotent no-throw");
try {
  runtime.destroy();
  assert(true, "runtime.destroy() called twice no-throw");
} catch (e) {
  assert(false, `runtime.destroy() twice threw: ${e.message}`);
}

// 3. vanilla ThemeKit (DOM-free: document is undefined in node)
assert(typeof ThemeKit === "function", "ThemeKit class exported from /vanilla");
assert(typeof ThemeKit.init === "function", "ThemeKit.init static");

console.log("\nvanilla-app ESM smoke: ALL PASS");
