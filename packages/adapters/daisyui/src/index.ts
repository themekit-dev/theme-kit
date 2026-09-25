/**
 * Theme Kit DaisyUI adapter — framework-neutral entry.
 *
 * Exports the React-free `createDaisyAdapter` factory (also available from
 * `@theme-kit/daisyui/factory`), the `createDaisyVariables` generator, and the
 * `injectDaisyCSS` helper. Framework wrappers live on their own subpaths:
 * `useDaisyTheme(runtime)` on `@theme-kit/daisyui/react`, and equivalent
 * composables/injectables on `/vue`, `/svelte`, `/solid`, and `/angular`.
 *
 * @packageDocumentation
 */
import daisyCss from "./daisyui.css";

import { createDaisyAdapter } from "./adapter";
import { createDaisyVariables } from "./generator";

export { createDaisyAdapter, createDaisyVariables };
export type { CreateDaisyAdapterOptions } from "./adapter";
export type { DaisyAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/daisyui";

/**
 * Injects the daisyUI compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useDaisyTheme` installs an adapter.
 */
export function injectDaisyCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = daisyCss;
  document.head.appendChild(style);
}
