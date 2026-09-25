import React, { type ReactNode } from "react";
import type { ThemeDefinition } from "@theme-kit/core";
import { useThemeFamily, useThemeMode, useThemeValue } from "./hooks";

/**
 * Which bootstrap-owned value a {@link ThemeReadout} displays.
 *
 * @see {@link ThemeReadout}
 */
export type ThemeReadoutKind = "theme" | "mode" | "family";

/**
 * Props for {@link ThemeReadout}.
 *
 * @see {@link ThemeReadout}
 */
export interface ThemeReadoutProps {
  /** The value to display. */
  kind: ThemeReadoutKind;
  /** Rendered when the value is not available. Defaults to nothing. */
  fallback?: ReactNode;
  /** Class applied to the wrapping `<span>`. */
  className?: string;
}

/**
 * Renders a theme-derived value that the **server cannot know**, without the
 * post-hydration settle — and without the caller having to remember the
 * contract that makes it work.
 *
 * @param props - The readout props (see {@link ThemeReadoutProps}).
 * @returns A `<span>` carrying the bootstrap-readout contract.
 *
 * @example
 * ```tsx
 * Active theme <ThemeReadout kind="theme" fallback="—" />
 * ```
 *
 * @remarks
 * For `mode: "system"` the server renders a fallback it cannot verify (it cannot
 * read `prefers-color-scheme`). The pre-paint bootstrap resolves the real value
 * and patches this element's text before the first paint, so the readout is
 * correct from frame one instead of correcting itself after hydration.
 *
 * Two attributes make that work, and this component is the reason callers do not
 * have to know about them:
 *
 * - `data-tk-readout` marks the node as bootstrap-owned, so the end-of-body
 *   patch script (see `createThemeReadoutScript`) writes the resolved value into
 *   it.
 * - `suppressHydrationWarning` tells React that this text node is intentionally
 *   divergent: React renders its own (server) value, sees the DOM already
 *   differs, and neither warns nor rewrites it. Its post-hydration render then
 *   produces the live value — the same value the script wrote — so nothing
 *   moves.
 *
 * Drop either one and the settle comes back: without the marker nothing patches
 * the text, and without the suppression React rewrites the server's fallback
 * over the patched value and then corrects it again.
 *
 * It degrades safely. If the bootstrap is not present (for example
 * `injectBootstrap: false` with no replacement) the patch script returns
 * immediately, the server-rendered fallback stays on screen, and no exception is
 * thrown — so this is progressive enhancement, not a hard runtime dependency.
 *
 * A value that is not one of the three semantic kinds — a resolved CSS variable,
 * say — is not covered here. Use the raw contract for that:
 * `data-tk-readout="var:--theme-color-primary"` plus `suppressHydrationWarning`
 * on the element that renders the value.
 *
 * @see {@link ThemeReadoutKind}
 * @see {@link ThemeReadoutProps}
 */
export function ThemeReadout({ kind, fallback = null, className }: ThemeReadoutProps) {
  const theme = useThemeValue<ThemeDefinition>();
  const mode = useThemeMode();
  const family = useThemeFamily();

  const value =
    kind === "theme" ? String(theme.name) : kind === "mode" ? mode : family;

  return (
    <span className={className} data-tk-readout={kind} suppressHydrationWarning>
      {value ?? fallback}
    </span>
  );
}

export default ThemeReadout;
