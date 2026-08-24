/**
 * Phase 1 — Bootstrap: hide native scrollbar before first paint.
 *
 * This is a tiny, dependency-free, blocking `<script>` that runs before
 * React. It does ONE thing: inject a `<style>` and add `tk-scrollbar`
 * to `<html>` so the native scrollbar is never painted.
 *
 *   No DOM creation.
 *   No observers.
 *   No listeners.
 *   No React.
 *   No rAF.
 *
 * Executes in under 1 ms.
 *
 * The overlay (ThemeScrollbar) handles everything else: measure, draw,
 * animate, drag, hover, physics. When the overlay has been painted once,
 * it adds `tk-scrollbar-ready` to `<html>` — enabling CSS fade-in.
 *
 * Architecture:
 *
 *   Phase 1 — Bootstrap (this module)
 *     └─ hide native scrollbar
 *     └─ add tk-scrollbar
 *
 *   Phase 2 — ThemeScrollbar (React / Web / Angular)
 *     └─ create overlay
 *     └─ measure
 *     └─ attach listeners (scroll, resize, pointer, wheel, MutationObserver)
 *
 *   Phase 3 — Ready
 *     └─ tk-scrollbar-ready
 *     └─ overlay fades in via CSS
 *
 * Next.js (`@theme-kit/next`) server-renders the `tk-scrollbar` class on
 * `<html>` and inlines `createPrePaintScrollbarCSS()` as a `<style>` in
 * `<head>` when the `scrollbar` prop is set — so the native bar is hidden
 * from the very first paint AND React hydrates without a class mismatch.
 * Emitting `createPrePaintScrollbarScript()` yourself is only needed when
 * you're not on `@theme-kit/next` (no SSR of the class).
 */

export type PrePaintScrollbarOptions = {
  /** Keep native scrollbars on touch / coarse-pointer devices. Default `false`. */
  touch?: boolean;
};

/** The CSS that hides native scrollbars while `tk-scrollbar` is present on
 *  `<html>`. Shared by the client bootstrap script and Next's SSR output so
 *  both apply identical rules. */
export const PRE_PAINT_SCROLLBAR_CSS =
  "html.tk-scrollbar,body.tk-scrollbar{scrollbar-width:none;-ms-overflow-style:none}" +
  "html.tk-scrollbar::-webkit-scrollbar,body.tk-scrollbar::-webkit-scrollbar{width:0;height:0}" +
  "html.tk-scrollbar *{scrollbar-width:none;-ms-overflow-style:none}" +
  "html.tk-scrollbar *::-webkit-scrollbar{width:0!important;height:0!important}" +
  "[data-theme-kit-scrollbar=overlay]::-webkit-scrollbar,[data-theme-kit-scrollbar=overlay] body::-webkit-scrollbar{width:0!important;height:0!important}" +
  "[data-theme-kit-scrollbar=overlay]{scrollbar-width:none;-ms-overflow-style:none}";

/** The hiding CSS, for SSR output (e.g. Next inlines it as a `<style>` in
 *  `<head>`). Use together with the `tk-scrollbar` class on `<html>`. */
export function createPrePaintScrollbarCSS(): string {
  return PRE_PAINT_SCROLLBAR_CSS;
}

/**
 * Generate a blocking `<script>` that hides the native scrollbar before
 * first paint. The script is idempotent — calling it multiple times is safe.
 * On coarse-pointer devices it returns early (unless `touch` is forced), so
 * native scrollbars are kept.
 */
export function createPrePaintScrollbarScript(
  options: PrePaintScrollbarOptions = {},
): string {
  const touch = options.touch ?? false;

  return `(function(){
try{
var doc=document,el=doc.documentElement;
if(el.classList.contains("tk-scrollbar"))return;
var coarse=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;
if(coarse&&!${JSON.stringify(touch)})return;
el.classList.add("tk-scrollbar");
var s=doc.createElement("style");
s.id="tk-scrollbar-style";
s.textContent=${JSON.stringify(PRE_PAINT_SCROLLBAR_CSS)};
doc.head.appendChild(s);
}catch(e){}})();`;
}
