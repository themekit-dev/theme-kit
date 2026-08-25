"use client";

import { ThemeInspector } from "@theme-kit/next/client";

export function SiteToolbar() {
  return (
    <div className="hidden md:block">
      {/* z-index 50 sits below the search dialog's backdrop (z-60) and dialog
          (z-100), so opening search naturally covers the floating inspector —
          same layer as the scroll-to-top button (z-50). */}
      <ThemeInspector zIndex={34} />
    </div>
  );
}
