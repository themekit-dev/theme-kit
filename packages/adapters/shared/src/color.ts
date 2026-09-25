/**
 * An 8-bit RGB color triplet, each channel in the range `0`–`255`.
 *
 * @see {@link hexToRgb}
 */
export interface RGB {
  /** Red channel, `0`–`255`. */
  r: number;
  /** Green channel, `0`–`255`. */
  g: number;
  /** Blue channel, `0`–`255`. */
  b: number;
}

/**
 * Parses a hex color string into an {@link RGB} triplet.
 *
 * Accepts `#rgb` (3-digit) and `#rrggbb` (6-digit) forms. A leading `#` is
 * required; any other input returns `null`.
 *
 * @param color The hex color string to parse.
 * @returns The parsed triplet, or `null` when the input is not a valid hex color.
 *
 * @see {@link rgbToHex}
 */
export function hexToRgb(color: string): RGB | null {
  const trimmed = color.trim();
  if (!trimmed.startsWith("#")) return null;

  const hex = trimmed.slice(1);
  if (hex.length === 3) {
    const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
    return null;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
    return null;
  }
  return null;
}

/**
 * Serializes an {@link RGB} triplet to a `#rrggbb` hex string.
 *
 * Each channel is clamped to `0`–`255` and rounded before serialization.
 *
 * @param rgb The triplet to serialize.
 * @returns The `#rrggbb` hex string.
 *
 * @see {@link hexToRgb}
 */
export function rgbToHex(rgb: RGB): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`;
}

/**
 * Linearly interpolates between two {@link RGB} triplets.
 *
 * Each channel is computed as `a + (b - a) * t` and clamped to `0`–`255`.
 *
 * @param a The starting triplet (`t = 0`).
 * @param b The ending triplet (`t = 1`).
 * @param t The interpolation factor, typically `0`–`1`.
 * @returns The interpolated triplet.
 *
 * @see {@link mixColors}
 */
export function mixHex(a: RGB, b: RGB, t: number): RGB {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return {
    r: clamp(a.r + (b.r - a.r) * t),
    g: clamp(a.g + (b.g - a.g) * t),
    b: clamp(a.b + (b.b - a.b) * t),
  };
}

/**
 * Mixes two hex colors by interpolating their RGB channels.
 *
 * When either input is not a valid hex color, the closer input (`t < 0.5`
 * picks `a`, otherwise `b`) is returned unchanged.
 *
 * @param a The starting hex color (`t = 0`).
 * @param b The ending hex color (`t = 1`).
 * @param t The interpolation factor, typically `0`–`1`.
 * @returns The mixed color as a `#rrggbb` hex string.
 *
 * @see {@link mixHex}
 */
export function mixColors(a: string, b: string, t: number): string {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return t < 0.5 ? a : b;
  return rgbToHex(mixHex(rgbA, rgbB, t));
}

/** `r, g, b` triplet (used by Bootstrap `--*-rgb` variables). */
export function rgbTriplet(color: string): string | undefined {
  const rgb = hexToRgb(color);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : undefined;
}

/**
 * Generates a `count`-step tonal scale from a single base color. The base
 * color sits exactly at `baseIndex`; lighter steps blend towards white and
 * darker steps towards black. Non-hex colors are repeated unchanged.
 */
export function generateShades(
  baseColor: string,
  count: number,
  baseIndex: number,
): string[] {
  const base = hexToRgb(baseColor);
  if (!base) return Array.from({ length: count }, () => baseColor);

  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };
  const safeIndex = Math.max(0, Math.min(count - 1, baseIndex));
  const shades: string[] = [];

  for (let i = 0; i < count; i++) {
    if (i < safeIndex) {
      const a = safeIndex > 0 ? i / safeIndex : 0;
      shades.push(rgbToHex(mixHex(white, base, a)));
    } else if (i === safeIndex) {
      shades.push(rgbToHex(base));
    } else {
      const denom = count - 1 - safeIndex;
      const t = denom > 0 ? (i - safeIndex) / denom : 0;
      shades.push(rgbToHex(mixHex(base, black, t)));
    }
  }
  return shades;
}