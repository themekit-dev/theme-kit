import { createSystem, defaultConfig } from "@chakra-ui/react";
import {
  resolveAdapterSource,
  type AdapterResolvedTheme,
  type AdapterSource,
  generateShades,
  readBreakpoints,
  readColor,
  readFontFamily,
  readRadius,
} from "@theme-kit/adapters";

const CHAKRA_SCALE = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

interface TokenValue {
  value: string;
}

function value(v: string): TokenValue {
  return { value: v };
}

function toScale(baseColor: string): Record<string, TokenValue> {
  const shades = generateShades(baseColor, CHAKRA_SCALE.length, 6);
  const scale: Record<string, TokenValue> = {};
  CHAKRA_SCALE.forEach((step, i) => {
    scale[step] = value(shades[i] ?? baseColor);
  });
  return scale;
}

/**
 * Chakra v3 requires custom colors used with `colorPalette` to also expose
 * these semantic keys so the semantic aliases resolve against the palette.
 */
function paletteSemantics(
  name: string,
): Record<string, {
  solid: TokenValue;
  contrast: TokenValue;
  fg: TokenValue;
  muted: TokenValue;
  subtle: TokenValue;
  emphasized: TokenValue;
  focusRing: TokenValue;
}> {
  return {
    [name]: {
      solid: value(`{colors.${name}.500}`),
      contrast: value(`{colors.${name}.100}`),
      fg: value(`{colors.${name}.700}`),
      muted: value(`{colors.${name}.100}`),
      subtle: value(`{colors.${name}.200}`),
      emphasized: value(`{colors.${name}.300}`),
      focusRing: value(`{colors.${name}.500}`),
    },
  };
}

/**
 * Builds the Chakra UI (v3) theme config from Theme Kit semantic tokens.
 */
export function buildChakraConfig(theme: AdapterResolvedTheme) {
  const c = (key: string, fallback?: string) => readColor(theme, key, fallback);
  const family = readFontFamily(theme.tokens);
  const monoFamily = readFontFamily(theme.tokens, "ui-monospace, monospace");
  const radius = readRadius(theme, "lg");

  const tokens = {
    colors: {
      primary: toScale(c("primary", "#000000") ?? "#000000"),
      accent: toScale(c("accent", c("primary")) ?? "#000000"),
      secondary: toScale(c("secondary", c("muted")) ?? "#e2e8f0"),
      destructive: toScale(c("destructive") ?? "#dc2626"),
    },
    fonts: {
      body: value(family),
      heading: value(family),
      mono: value(monoFamily),
    },
    radii: {
      xs: value(radius),
      sm: value(radius),
      md: value(radius),
      lg: value(radius),
      xl: value(radius),
      "2xl": value(radius),
    },
  };

const semanticTokens = {
    colors: {
      background: value(c("background", "#ffffff") ?? "#ffffff"),
      foreground: value(c("foreground", "#0f172a") ?? "#0f172a"),
      card: value(c("card", c("background")) ?? "#ffffff"),
      cardForeground: value(c("cardForeground", c("foreground")) ?? "#0f172a"),
      popover: value(c("popover", c("card")) ?? "#ffffff"),
      popoverForeground: value(c("popoverForeground", c("foreground")) ?? "#0f172a"),
      primaryContrast: value(c("primaryForeground", "#ffffff") ?? "#ffffff"),
      secondary: value(c("secondary", "#e2e8f0") ?? "#e2e8f0"),
      secondaryForeground: value(c("secondaryForeground", c("foreground")) ?? "#0f172a"),
      muted: value(c("muted") ?? "#e2e8f0"),
      mutedForeground: value(c("mutedForeground", c("muted")) ?? "#64748b"),
      accentForeground: value(c("accentForeground", c("foreground")) ?? "#0f172a"),
      destructiveForeground: value(c("destructiveForeground", "#ffffff") ?? "#ffffff"),
      border: value(c("border", c("muted")) ?? "#e2e8f0"),
      input: value(c("input", c("border")) ?? "#e2e8f0"),
      ring: value(c("ring", c("primary")) ?? "#000000"),
      // Chakra v3 requires every custom color used with `colorPalette` to expose
      // these semantic keys (solid/contrast/fg/…). Without them, `colorPalette`
      // maps the color *scale* but the semantic aliases (solid/fg/muted/…) still
      // resolve to the default palette, leaving recipes zinc/gray.
      ...paletteSemantics("primary"),
      ...paletteSemantics("secondary"),
      ...paletteSemantics("accent"),
      ...paletteSemantics("destructive"),
    },
  };

  const breakpoints = readBreakpoints(theme.tokens, {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  });

  return { tokens, semanticTokens, breakpoints };
}

/**
 * Creates a Chakra UI system from a Theme Kit source.
 *
 * ```ts
 * import { createChakraTheme } from "@theme-kit/chakra";
 * const system = createChakraTheme(runtime);
 * ```
 */
export function createChakraTheme(source: AdapterSource) {
  const resolved = resolveAdapterSource(source);
  return createSystem(defaultConfig, {
    theme: buildChakraConfig(resolved),
  });
}