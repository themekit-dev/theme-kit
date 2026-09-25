/**
 * Re-exported from `@theme-kit/core`.
 *
 * The fingerprint is part of the **stable cookie contract**
 * (`theme-mode` / `theme-family` / `theme-fingerprint`), so it has to be
 * byte-identical across every SSR integration. Astro, Next, Nuxt and Remix each
 * carried a private copy; they now share core's implementation. This module
 * keeps the package-internal import path (`./fingerprint`) working.
 *
 * @see {@link computeFingerprint}
 */
export { computeFingerprint } from "@theme-kit/core";
