import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { themeKitVitePlugin } from "@theme-kit/core/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    themeKitVitePlugin({
      // Build-time only. The theme data lives in `theme.config.ts`, which the
      // plugin discovers — so there is nothing to repeat here.
      //
      // The native scrollbar is hidden before first paint, so the overlay this
      // app mounts is the only scrollbar the page ever paints. Without it the
      // engine hides the native bar only at mount, which is late enough to
      // flash whenever the document is scrollable before the overlay mounts.
      scrollbar: true,
    }),
  ],
});
