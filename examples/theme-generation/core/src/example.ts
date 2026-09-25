import { generateTheme } from "@theme-kit/core";

/**
 * `generateTheme` derives a complete light/dark family from a single seed
 * colour, so you can ship a brand palette without hand-authoring every token.
 */
const { light, dark } = generateTheme({
  seed: "#d97706",
  family: "sunset",
});

console.log("light:", light.name, "→", light.meta?.family, light.meta?.mode);
console.log("dark: ", dark.name, "→", dark.meta?.family, dark.meta?.mode);
console.log("light background:", light.tokens?.colors?.background);
console.log("light primary:   ", light.tokens?.colors?.primary);
console.log("dark background: ", dark.tokens?.colors?.background);

/** `withCode` additionally generates a `tokens.code` block for syntax surfaces. */
const withCode = generateTheme({ seed: "#0ea5e9", family: "sky", withCode: true });
console.log("code tokens generated:", withCode.light.tokens?.code !== undefined);
