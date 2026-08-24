function getLuminance(hex: string): number {
  const clean = hex.replace(/^#/, "");
  if (clean.length < 6) return 0;

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function isHexColor(value: string): boolean {
  return /^#[\da-fA-F]{6,8}$/.test(value);
}

export function contrast(background: string): string {
  const color = isHexColor(background) ? background : `#${background}`;
  if (!isHexColor(color)) return "#000000";
  const luminance = getLuminance(color);
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

export function auto(
  tokenName: string,
  lookup: (path: string) => string | undefined,
): string {
  const match = tokenName.match(/^(.+?)(?:Foreground|foreground)$/);
  if (match) {
    const base = match[1]!;
    const candidates = [
      `colors.${base}`,
      base,
      `${base}.default`,
      `colors.${base}.default`,
      `colors.${base}.DEFAULT`,
      base.toLowerCase(),
    ];
    for (const candidate of candidates) {
      const value = lookup(candidate);
      if (value && isHexColor(value)) {
        return contrast(value);
      }
    }
  }

  const broaderMatch = tokenName.match(/^(.+?)Fg$/);
  if (broaderMatch) {
    const base = broaderMatch[1]!;
    const value = lookup(`colors.${base}`) || lookup(base);
    if (value && isHexColor(value)) {
      return contrast(value);
    }
  }

  return "#000000";
}

/** @internal */
export function isContrastCall(value: string): boolean {
  return /^contrast\s*\(\s*[^)]+\s*\)$/.test(value);
}

/** @internal */
export function parseContrastCall(value: string): string | null {
  const match = value.match(/^contrast\s*\(\s*([^)]+)\s*\)$/);
  return match && match[1] ? match[1].trim() : null;
}

/** @internal */
export function isAutoCall(value: string): boolean {
  return /^auto\s*\(\s*\)$/.test(value);
}
