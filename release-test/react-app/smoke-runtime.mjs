// React consumer runtime smoke — renders ThemeProvider via SSR (no browser).
import { ThemeProvider } from "@theme-kit/react";
import { renderToString } from "react-dom/server";
import { createElement, StrictMode } from "react";

function assert(cond, label) {
  if (!cond) {
    console.error(`✗ ${label}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

const themes = [
  { name: "light", tokens: { colors: { background: "#fff" } } },
  { name: "dark", tokens: { colors: { background: "#000" } } },
];

const html = renderToString(
  createElement(StrictMode, null,
    createElement(ThemeProvider, {
      themes,
      defaultTheme: "light",
      initialMode: "system",
      // SSR: no client-only persistence/broadcast (also keeps the process clean)
      broadcast: null,
      persistence: null,
      children: createElement("div", { id: "content" }, "hello react"),
    })
  )
);

assert(html.includes("hello react"), "ThemeProvider SSR renders children");
assert(html.includes("content"), "ThemeProvider SSR preserves props");

console.log("\nreact-app runtime smoke: ALL PASS");
