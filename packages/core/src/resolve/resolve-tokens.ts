import type { ThemeTokens, ThemeColors } from "../model/tokens";
import {
  flattenTokens,
  resolveFlatTokens,
  hasTokenReferences,
  resolveValueReferences,
} from "./resolve-token-references";
import { isExpression, evaluateExpression } from "./token-expressions";
import {
  isContrastCall,
  parseContrastCall,
  isAutoCall,
  contrast,
  auto,
} from "./derived-tokens";

function resolveNestedColorValue(
  value: string,
  path: string,
  flat: Record<string, string>,
  resolvedFlat: Record<string, string>,
): string {
  let current = value;

  if (isAutoCall(current)) {
    current = auto(path, (p) => flat[p] ?? resolvedFlat[p]);
    resolvedFlat[path] = current;
    return current;
  }

  const contrastRef = parseContrastCall(current);
  if (contrastRef) {
    const bg = resolvedFlat[contrastRef]
      ?? resolvedFlat[`colors.${contrastRef}`]
      ?? resolvedFlat[`${contrastRef}.default`]
      ?? resolvedFlat[`colors.${contrastRef}.default`]
      ?? flat[contrastRef]
      ?? flat[`colors.${contrastRef}`]
      ?? flat[`${contrastRef}.default`]
      ?? flat[`colors.${contrastRef}.default`]
      ?? contrastRef;
    current = contrast(bg);
    resolvedFlat[path] = current;
    return current;
  }

  if (hasTokenReferences(current)) {
    current = resolveValueReferences(current, { ...flat, ...resolvedFlat });
  }

  if (isExpression(current)) {
    current = evaluateExpression(current);
  }

  resolvedFlat[path] = current;
  return current;
}

function walkAndResolveColors(
  obj: ThemeColors,
  basePath: string,
  flat: Record<string, string>,
  resolvedFlat: Record<string, string>,
): ThemeColors {
  const result: ThemeColors = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = basePath ? `${basePath}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      result[key] = walkAndResolveColors(value as ThemeColors, path, flat, resolvedFlat);
    } else if (typeof value === "string") {
      result[key] = resolveNestedColorValue(value, path, flat, resolvedFlat);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function walkAndResolveFlatMap(
  obj: Record<string, string>,
  category: string,
  flat: Record<string, string>,
  resolvedFlat: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = `${category}.${key}`;
    let current = value;

    if (isAutoCall(current)) {
      current = auto(path, (p) => flat[p] ?? resolvedFlat[p]);
    } else {
      const contrastRef = parseContrastCall(current);
      if (contrastRef) {
        const bg = resolvedFlat[contrastRef] ?? flat[contrastRef] ?? contrastRef;
        current = contrast(bg);
      } else {
        if (hasTokenReferences(current)) {
          current = resolveValueReferences(current, { ...flat, ...resolvedFlat });
        }
        if (isExpression(current)) {
          current = evaluateExpression(current);
        }
      }
    }

    resolvedFlat[path] = current;
    result[key] = current;
  }
  return result;
}

export function resolveTokens(tokens: ThemeTokens): ThemeTokens {
  if (!tokens) return tokens;

  const flat = flattenTokens(tokens);
  const resolvedFlat: Record<string, string> = {};

  const resolved: ThemeTokens = {};

  if (tokens.colors) {
    resolved.colors = walkAndResolveColors(tokens.colors, "", flat, resolvedFlat);
  }

  if (tokens.spacing) {
    resolved.spacing = walkAndResolveFlatMap(tokens.spacing, "spacing", flat, resolvedFlat);
  }

  if (tokens.radius) {
    resolved.radius = walkAndResolveFlatMap(tokens.radius, "radius", flat, resolvedFlat);
  }

  if (tokens.shadows) {
    resolved.shadows = walkAndResolveFlatMap(tokens.shadows, "shadows", flat, resolvedFlat);
  }

  if (tokens.borderWidths) {
    resolved.borderWidths = walkAndResolveFlatMap(tokens.borderWidths, "borderWidths", flat, resolvedFlat);
  }

  if (tokens.zIndex) {
    resolved.zIndex = walkAndResolveFlatMap(tokens.zIndex, "zIndex", flat, resolvedFlat);
  }

  if (tokens.breakpoints) {
    resolved.breakpoints = walkAndResolveFlatMap(tokens.breakpoints, "breakpoints", flat, resolvedFlat);
  }

  if (tokens.typography) {
    const typography: ThemeTokens["typography"] = {};
    if (tokens.typography.fontFamilies) {
      typography.fontFamilies = walkAndResolveFlatMap(
        tokens.typography.fontFamilies,
        "typography.fontFamilies",
        flat,
        resolvedFlat,
      );
    }
    if (tokens.typography.fontSizes) {
      typography.fontSizes = walkAndResolveFlatMap(
        tokens.typography.fontSizes,
        "typography.fontSizes",
        flat,
        resolvedFlat,
      );
    }
    if (tokens.typography.lineHeights) {
      typography.lineHeights = walkAndResolveFlatMap(
        tokens.typography.lineHeights,
        "typography.lineHeights",
        flat,
        resolvedFlat,
      );
    }
    if (Object.keys(typography).length > 0) {
      resolved.typography = typography;
    }
  }

  if (tokens.code) {
    resolved.code = walkAndResolveFlatMap(
      tokens.code as Record<string, string>,
      "code",
      flat,
      resolvedFlat,
    ) as unknown as NonNullable<ThemeTokens["code"]>;
  }

  return Object.keys(resolved).length > 0 ? resolved : tokens;
}
