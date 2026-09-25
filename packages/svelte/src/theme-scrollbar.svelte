<script lang="ts">
  import {
    createOverlayScrollbar,
    createPrePaintScrollbarScript,
  } from "@theme-kit/core";
  import { getThemeRuntime } from "./context";
  import { pickOptions, type ThemeScrollbarProps } from "./scrollbar-options";

  let props: ThemeScrollbarProps = $props();
  const runtime = getThemeRuntime();

  // Phase 1 — hide the native scrollbar before the first paint. Idempotent:
  // when the Vite plugin or an SSR adapter already emitted it, this no-ops.
  $effect.pre(() => {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById("tk-scrollbar-style")) return;
    const script = document.createElement("script");
    script.text = createPrePaintScrollbarScript();
    document.head.appendChild(script);
  });

  // Phase 2 — the overlay. The engine resolves its options once, when the
  // overlay is created, so `$effect` rebuilding it is what makes a changed
  // option apply: it re-runs whenever any option `pickOptions` reads changes.
  $effect(() => {
    const handle = createOverlayScrollbar(runtime.store, pickOptions(props));
    return () => handle?.destroy();
  });
</script>
