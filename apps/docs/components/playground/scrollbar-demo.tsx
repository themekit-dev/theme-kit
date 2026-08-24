export function ScrollbarDemo() {
  return (
    <div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/40">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
            Live — the actual scrollbar
          </span>
          <span className="chip chip-active text-[11px]">
            runs on this docs site
          </span>
        </div>
        <div data-scrollbar-demo className="max-h-72 overflow-y-auto p-4">
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            This panel is a plain scrollable container, exactly like the one
            you would wrap in{" "}
            <code className="mono text-[0.9em]">{"include"}</code> to scope the
            overlay. On this site the real{" "}
            <code className="mono text-[0.9em]">ThemeScrollbar</code> from{" "}
            <code className="mono text-[0.9em]">@theme-kit/next</code> is
            mounted in the root layout — so every scrollable area on this
            page, including this one, is an integrated custom scrollbar. Run
            your cursor over the edge to reveal the theme-colored strip, then
            scroll.
          </p>
          {Array.from({ length: 14 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
            >
              <span
                className="w-6 h-6 shrink-0 rounded-md grid place-items-center text-[10px] font-bold"
                style={{
                  background: "var(--theme-color-secondary)",
                  color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
                }}
              >
                {i + 1}
              </span>
              <p className="text-sm opacity-80 leading-relaxed">
                Managed container — row {i + 1}. The native bar is hidden by
                the pre-paint bootstrap and the overlay strip represents the
                scroll position instead.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}