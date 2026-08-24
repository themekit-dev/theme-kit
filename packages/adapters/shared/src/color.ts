export interface RGB {
  r: number;
  g: number;
  b: number;
}

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

export function rgbToHex(rgb: RGB): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`;
}

export function mixHex(a: RGB, b: RGB, t: number): RGB {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return {
    r: clamp(a.r + (b.r - a.r) * t),
    g: clamp(a.g + (b.g - a.g) * t),
    b: clamp(a.b + (b.b - a.b) * t),
  };
}

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