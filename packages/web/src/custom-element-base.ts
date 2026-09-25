/**
 * Base class for Theme Kit custom elements that is safe to import in
 * non-DOM (SSR) environments.
 *
 * In the browser this is exactly `HTMLElement`. On the server it degrades to a
 * plain class so that importing `@theme-kit/web` (which Vue/Nuxt and other
 * SSR bundles pull in transitively) does not throw a `ReferenceError:
 * HTMLElement is not defined` at module load. The elements are only ever
 * constructed and registered (`customElements.define`) in the browser, so the
 * degraded base is never instantiated during server rendering.
 */
export const CustomElementBase: typeof HTMLElement =
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : (class {} as typeof HTMLElement);