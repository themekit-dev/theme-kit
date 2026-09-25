/**
 * Theme Kit Open Props adapter — framework-neutral entry.
 *
 * Exports the React-free `createOpenPropsAdapter` factory (also available from
 * `@theme-kit/open-props/factory`), the `createOpenPropsVariables` generator,
 * and the `injectOpenPropsCSS` helper. Framework wrappers live on their own
 * subpaths: `useOpenPropsTheme(runtime)` on `@theme-kit/open-props/react`, and
 * equivalent composables/injectables on `/vue`, `/svelte`, `/solid`, and
 * `/angular`.
 *
 * @packageDocumentation
 */
import openPropsCss from "./open-props.css";

import { createOpenPropsAdapter } from "./adapter";
import { createOpenPropsVariables } from "./generator";

export { createOpenPropsAdapter, createOpenPropsVariables };
export type { CreateOpenPropsAdapterOptions } from "./adapter";
export type { OpenPropsAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/open-props";

/**
 * Injects the Open Props compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useOpenPropsTheme` installs an adapter.
 */
export function injectOpenPropsCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = openPropsCss;
  document.head.appendChild(style);
}
