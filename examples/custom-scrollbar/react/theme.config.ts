import { defineThemeKitConfig } from "@theme-kit/core";
import { themes } from "./src/themes";

/**
 * The application's Theme Kit configuration — the single declaration.
 *
 * The Vite plugin discovers this file at the project root, derives the pre-paint
 * bootstrap from it, and transports it to the browser for the provider. Neither
 * the plugin nor the provider declares these values, so they cannot drift.
 */
export default defineThemeKitConfig({
  themes,
  defaultTheme: "base-light",
  initialMode: "system",
});
