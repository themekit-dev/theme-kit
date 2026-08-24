import type { ThemeDefinition } from "../model/theme";

export type CVDType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

const CVD_LABELS: Record<CVDType, string> = {
  protanopia: "Protanopia (Red-Blind)",
  deuteranopia: "Deuteranopia (Green-Blind)",
  tritanopia: "Tritanopia (Blue-Blind)",
  achromatopsia: "Achromatopsia (Total Color Blindness)",
};

/** @internal */
export function getCVDLabel(type: CVDType): string {
  return CVD_LABELS[type];
}

const RGB2LMS: [number, number, number][] = [
  [0.305717, 0.622722, 0.045276],
  [0.157786, 0.769667, 0.088050],
  [0.019334, 0.119192, 0.950304],
];

const LMS2RGB: [number, number, number][] = [
  [5.6194, -4.5730, 0.1558],
  [-1.1555, 2.2588, -0.1542],
  [0.0306, -0.1903, 1.0684],
];

function hexToLinearRGB(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return [linearize(r), linearize(g), linearize(b)];
}

function linearRGBToHex(rgb: [number, number, number]): string {
  const delinearize = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

  const clamp = (c: number) => Math.max(0, Math.min(1, c));

  const toHex = (n: number) =>
    Math.round(clamp(delinearize(n)) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function linearRGBToLMS([r, g, b]: [number, number, number]): [number, number, number] {
  return [
    (RGB2LMS[0]?.[0] ?? 0) * r + (RGB2LMS[0]?.[1] ?? 0) * g + (RGB2LMS[0]?.[2] ?? 0) * b,
    (RGB2LMS[1]?.[0] ?? 0) * r + (RGB2LMS[1]?.[1] ?? 0) * g + (RGB2LMS[1]?.[2] ?? 0) * b,
    (RGB2LMS[2]?.[0] ?? 0) * r + (RGB2LMS[2]?.[1] ?? 0) * g + (RGB2LMS[2]?.[2] ?? 0) * b,
  ];
}

function LMSToLinearRGB([l, m, s]: [number, number, number]): [number, number, number] {
  return [
    (LMS2RGB[0]?.[0] ?? 0) * l + (LMS2RGB[0]?.[1] ?? 0) * m + (LMS2RGB[0]?.[2] ?? 0) * s,
    (LMS2RGB[1]?.[0] ?? 0) * l + (LMS2RGB[1]?.[1] ?? 0) * m + (LMS2RGB[1]?.[2] ?? 0) * s,
    (LMS2RGB[2]?.[0] ?? 0) * l + (LMS2RGB[2]?.[1] ?? 0) * m + (LMS2RGB[2]?.[2] ?? 0) * s,
  ];
}

export function simulateCVD(hex: string, type: CVDType): string {
  if (!/^#[0-9a-fA-F]{6,8}$/.test(hex)) return hex;

  if (type === "achromatopsia") {
    const [r, g, b] = hexToLinearRGB(hex);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return linearRGBToHex([lum, lum, lum]);
  }

  const linear = hexToLinearRGB(hex);
  const lms = linearRGBToLMS(linear);
  let simulatedLMS: [number, number, number];

  switch (type) {
    case "protanopia":
      simulatedLMS = [lms[1], lms[1], lms[2]];
      break;
    case "deuteranopia":
      simulatedLMS = [lms[0], lms[0], lms[2]];
      break;
    case "tritanopia":
      simulatedLMS = [lms[0], lms[1], Math.min(lms[0], lms[1])];
      break;
    default:
      simulatedLMS = lms;
  }

  return linearRGBToHex(LMSToLinearRGB(simulatedLMS));
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6,8}$/.test(value);
}

function simulateColorValue(value: string, type: CVDType): string {
  const match = value.match(/^#[0-9a-fA-F]{6,8}$/);
  if (!match) return value;
  return simulateCVD(value, type);
}

function walkAndSimulate(
  obj: Record<string, unknown>,
  type: CVDType,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = simulateColorValue(value, type);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = walkAndSimulate(value as Record<string, unknown>, type);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function simulateThemeForCVD(
  theme: ThemeDefinition,
  type: CVDType,
): ThemeDefinition {
  const { tokens } = theme;
  if (!tokens || !tokens.colors) return theme;

  const colors = walkAndSimulate(
    tokens.colors as Record<string, unknown>,
    type,
  );

  const newTokens = { ...tokens, colors: colors as typeof tokens.colors };

  return {
    ...theme,
    tokens: newTokens,
  };
}
