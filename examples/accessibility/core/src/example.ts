import {
  defineTheme,
  getContrastRatio,
  validateThemeContrast,
} from "@theme-kit/core";

const oceanLight = defineTheme({
  name: "ocean-light",
  meta: { family: "ocean", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#0c1e2e",
      primary: "#0369a1",
      primaryForeground: "#ffffff",
      muted: "#e2e8f0",
      // Deliberately low contrast, so the validator has something to flag.
      mutedForeground: "#cbd5e1",
    },
  },
});

/** A single pair: WCAG contrast ratio, 1 (identical) to 21 (black on white). */
console.log(
  "foreground on background:",
  getContrastRatio("#0c1e2e", "#ffffff").toFixed(2),
);

/** Every semantic pair the theme declares, checked against WCAG AA/AAA. */
const result = validateThemeContrast(oceanLight);
console.log("passes WCAG AA for normal text:", result.valid);
for (const check of result.checks) {
  console.log(
    `  ${check.foregroundToken} on ${check.backgroundToken}: ` +
      `${check.ratio.toFixed(2)} — AA normal ${check.passesAANormal ? "pass" : "FAIL"}`,
  );
}
