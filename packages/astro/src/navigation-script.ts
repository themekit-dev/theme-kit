/**
 * Builds the tiny script that carries Theme Kit's resolved state across an
 * Astro client-side navigation (`<ClientRouter />`).
 *
 * A client navigation is not a hard reload: Astro parses the next page into a
 * detached document and then copies that document's `<html>` attributes over
 * the live root. Because the pre-paint bootstrap is byte-identical on every
 * page, Astro's script de-duplication marks it as already-executed, so it does
 * **not** run again — and the live root's theme state (the `dark` /
 * `tk-scrollbar` classes, the inline theme variables and the `data-theme*`
 * attributes written by the bootstrap or the runtime) would be replaced by
 * whatever that page was built with.
 *
 * This script listens for `astro:before-swap` — which Astro dispatches *before*
 * `swapRootAttributes()` reads the new document — and re-applies the live
 * state onto the incoming document, so the browser paints the correct theme
 * immediately instead of reverting until the island re-hydrates.
 *
 * It is framework-free, registers a single listener, and never touches the
 * runtime. Sites without `<ClientRouter />` never fire the event, so the
 * listener stays inert.
 *
 * @returns The inline script string to emit in the document `<head>`.
 *
 * @see {@link themeKit}
 * @see `createBlockingScript`
 */
export function createNavigationScript(): string {
  return (
    "(function(){try{" +
    "document.addEventListener('astro:before-swap',function(e){" +
    "var nd=e&&e.newDocument;" +
    "if(!nd||!nd.documentElement||!nd.head)return;" +
    "var src=document.documentElement,dst=nd.documentElement;" +
    "var cls=src.classList;" +
    "if(cls.contains('dark')){dst.classList.add('dark');}else{dst.classList.remove('dark');}" +
    "if(cls.contains('tk-scrollbar')){dst.classList.add('tk-scrollbar');" +
    "var st=document.getElementById('tk-scrollbar-style');" +
    "if(st&&!nd.getElementById('tk-scrollbar-style')){" +
    "nd.head.appendChild(nd.importNode(st,true));}}" +
    "var attrs=['data-theme','data-theme-family','data-theme-mode'];" +
    "for(var i=0;i<attrs.length;i++){" +
    "var v=src.getAttribute(attrs[i]);" +
    "if(v!==null){dst.setAttribute(attrs[i],v);}}" +
    "var style=src.getAttribute('style');" +
    "if(style!==null){dst.setAttribute('style',style);}" +
    "});" +
    "}catch(e){}})()"
  );
}
