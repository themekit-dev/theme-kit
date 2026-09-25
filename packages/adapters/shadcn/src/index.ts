/**
 * Theme Kit shadcn/ui adapter — framework-neutral entry.
 *
 * Exports the React-free `createShadcnAdapter` factory (also available from
 * `@theme-kit/shadcn/factory`), the `createShadcnVariables` generator, and the
 * `injectShadcnCSS` helper. Framework wrappers live on their own subpaths:
 * `useShadcnTheme(runtime)` on `@theme-kit/shadcn/react`, and equivalent
 * composables/injectables on `/vue`, `/svelte`, `/solid`, and `/angular`.
 *
 * @packageDocumentation
 */
import shadcnCss from "./shadcn.css";

import { createShadcnAdapter } from "./adapter";
import { createShadcnVariables } from "./generator";

export { createShadcnAdapter, createShadcnVariables };
export type { CreateShadcnAdapterOptions } from "./adapter";
export type { ShadcnAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/shadcn";

/**
 * Injects the shadcn/ui compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useShadcnTheme` installs an adapter.
 */
export function injectShadcnCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = shadcnCss;
  document.head.appendChild(style);
}
