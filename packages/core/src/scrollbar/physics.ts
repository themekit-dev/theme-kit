/**
 * Thumb Physics — the piece that makes the scrollbar feel premium.
 *
 * Instead of snapping the thumb to the scroll position (linear), the thumb
 * interpolates toward its target on every animation frame:
 *
 *   thumb += (target - thumb) * α
 *
 * This produces the "every modern premium UI does this" inertial easing. The
 * target is derived from the native scroll position; we only ever write
 * `transform: translate()` (GPU accelerated) — never `top`/`left`.
 */

/** Frame time in ms assumed for a 60 Hz display. */
export const FRAME_MS = 16.667;

/**
 * Exponential easing factor in [0,1] for the given easing time constant.
 * `timeConstant` is the number of ms it takes to cover ~63% of the distance.
 * A time constant of `0` snaps instantly.
 * @internal
 */
export function easeAlpha(animationDurationMs: number, dtMs = FRAME_MS): number {
  if (animationDurationMs <= 0) return 1;
  return 1 - Math.exp(-dtMs / animationDurationMs);
}

/** Single frame interpolation step. */
/** @internal */
export function lerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

/** True when two positions are close enough to consider the thumb "settled". */
export function isSettled(current: number, target: number, epsilon = 0.25): boolean {
  return Math.abs(current - target) <= epsilon;
}

/** Requested motion profile. Reduced motion snaps instantly. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}