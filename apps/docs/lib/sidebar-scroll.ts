// Shared constants for the docs sidebar scroll persistence. This module has no
// "use client" directive so it can be imported by both the server root layout
// (which renders the pre-paint script) and the client DocsLayout (which reads
// and saves the position).
export const SIDEBAR_SCROLL_KEY = "tk-docs-sidebar-scroll";

/**
 * Blocking inline script rendered near the end of the document (in the root
 * layout, after the sidebar has been parsed). It runs while the HTML streams
 * in and sets scrollTop before the browser's first paint — blocking parsing
 * means the rail can never be painted at the top first. This is the only
 * reliably jitter-free mechanism: a head-injected script that defers to
 * `DOMContentLoaded` still paints scrollTop 0 for ~70ms (verified in a real
 * browser), because these cookie-driven pages paint incrementally.
 */
export const SIDEBAR_PRE_PAINT_SCRIPT = `(function(){try{var r=sessionStorage.getItem("${SIDEBAR_SCROLL_KEY}");var s=parseInt(r,10);if(s>0){var e=document.querySelector("[data-docs-sidebar]");if(e){e.scrollTop=s;}}}catch(err){}})();`;
