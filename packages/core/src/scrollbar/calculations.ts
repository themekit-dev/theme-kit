import type { ScrollbarAxis } from "./types";

/** @internal */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function toArray<T>(value: T[] | T | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Dynamic thumb size, mirroring native browsers:
 *   clientSize² / contentSize
 * clamped to [minThumbSize, clientSize - 2·offset].
 * @internal
 */
export function computeThumbSize(
  clientLen: number,
  contentLen: number,
  minThumbSize: number,
  offset: number,
): number {
  if (contentLen <= clientLen) return 0;
  const ideal = (clientLen * clientLen) / contentLen;
  return clamp(Math.round(ideal), minThumbSize, clientLen - offset * 2);
}

/** @internal */
export function computeMaxScroll(contentLen: number, clientLen: number): number {
  return Math.max(contentLen - clientLen, 0);
}

/** @internal */
export function computeTranslate(progress: number, clientSize: number, thumbSize: number, offset: number): number {
  const maxTranslate = clientSize - thumbSize - offset * 2;
  return progress * maxTranslate;
}

/**
 * Subtle thumb compression near the scroll boundaries (rubber-band / overscroll).
 * Returns `1` when centered; shrinks toward `minFactor` as you overshoot.
 * @internal
 */
export function overscrollFactor(
  scrollPos: number,
  maxScroll: number,
  clientLen: number,
  enabled: boolean,
  maxCompress = 0.18,
): number {
  if (!enabled) return 1;
  let over = 0;
  if (scrollPos < 0) over = -scrollPos;
  else if (scrollPos > maxScroll) over = scrollPos - maxScroll;
  if (over <= 0) return 1;
  const t = clamp(over / Math.max(clientLen, 1), 0, 1);
  return 1 - maxCompress * t;
}