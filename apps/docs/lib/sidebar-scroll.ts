// Pre-paint positioning for the docs sidebar.
//
// This module has no "use client" directive so it can be imported by the server
// root layout, which renders the script into the document.

/**
 * Blocking inline script rendered near the end of the document (in the root
 * layout, after the sidebar has been parsed). It runs while the HTML streams
 * in and sets scrollTop before the browser's first paint — blocking parsing
 * means the rail can never be painted at the top first. This is the only
 * reliably jitter-free mechanism: a head-injected script that defers to
 * `DOMContentLoaded` still paints scrollTop 0 for ~70ms (verified in a real
 * browser), because these cookie-driven pages paint incrementally.
 *
 * It **centers the active link**, rather than restoring the last scroll offset.
 * Restoring the offset meant that reloading after scrolling the rail returned
 * you to wherever you had left it — which, if you had scrolled away from the
 * page you were on, hid the very link you were looking for. Centring the active
 * item answers the only question the rail is asked on load: "where am I?".
 *
 * Two no-ops keep it free of side effects: nothing happens when the whole nav
 * already fits (the active link is visible by definition), and nothing happens
 * when no link is current.
 */
export const SIDEBAR_PRE_PAINT_SCRIPT = `(function(){try{
var e=document.querySelector("[data-docs-sidebar]");
if(!e)return;
if(e.scrollHeight<=e.clientHeight)return;
var a=e.querySelector('[aria-current="page"]');
if(!a)return;
var er=e.getBoundingClientRect(),ar=a.getBoundingClientRect();
var top=e.scrollTop+(ar.top-er.top)-(e.clientHeight-ar.height)/2;
e.scrollTop=Math.max(0,top);
}catch(err){}})();`;

/**
 * Scrolls the rail so the current page's link sits in the middle of it.
 *
 * `SIDEBAR_PRE_PAINT_SCRIPT` above is this same arithmetic, inlined into the
 * document so it can run before the first paint. Keep the two in step.
 *
 * Centering — rather than restoring a remembered offset — is what makes this
 * safe to run on every client-side navigation: it is computed against the
 * layout as it is at that moment, so a rail whose collapsible groups have just
 * changed height still lands somewhere meaningful, and the browser's scroll
 * anchoring has nothing to correct afterwards.
 */
export function centerActiveSidebarLink(rail: HTMLElement): void {
  if (rail.scrollHeight <= rail.clientHeight) return;

  const active = rail.querySelector<HTMLElement>('[aria-current="page"]');
  if (!active) return;

  const railRect = rail.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const top =
    rail.scrollTop +
    (activeRect.top - railRect.top) -
    (rail.clientHeight - activeRect.height) / 2;

  rail.scrollTop = Math.max(0, top);
}
