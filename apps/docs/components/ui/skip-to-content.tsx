/**
 * Keyboard-only "Skip to content" link. Visually hidden until focused, at
 * which point it renders as a fixed button in the top-left corner.
 */
export function SkipToContent({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary"
    >
      Skip to content
    </a>
  );
}
