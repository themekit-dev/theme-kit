import type { ThemeTokens } from "../model/tokens";

const DOLLAR_REF = /(?:\$([\w.]+))/;
const GLOBAL_DOLLAR_REF = /(?:\$([\w.]+))/g;
const BRACE_REF = /(?:\{([\w.]+)\})/;
const GLOBAL_BRACE_REF = /(?:\{([\w.]+)\})/g;

export function flattenTokens(tokens: ThemeTokens): Record<string, string> {
  const flat: Record<string, string> = {};

  function addEntries(obj: Record<string, unknown> | undefined, basePath: string) {
    if (!obj) return;
    for (const [key, value] of Object.entries(obj)) {
      const path = basePath ? `${basePath}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        addEntries(value as Record<string, unknown>, path);
      } else if (typeof value === "string") {
        flat[path] = value;
      }
    }
  }

  if (tokens.colors) addEntries(tokens.colors as unknown as Record<string, unknown>, "colors");
  if (tokens.spacing) addEntries(tokens.spacing, "spacing");
  if (tokens.radius) addEntries(tokens.radius, "radius");
  if (tokens.shadows) addEntries(tokens.shadows, "shadows");
  if (tokens.borderWidths) addEntries(tokens.borderWidths, "borderWidths");
  if (tokens.zIndex) addEntries(tokens.zIndex, "zIndex");
  if (tokens.breakpoints) addEntries(tokens.breakpoints, "breakpoints");
  if (tokens.typography) {
    if (tokens.typography.fontFamilies) addEntries(tokens.typography.fontFamilies, "typography.fontFamilies");
    if (tokens.typography.fontSizes) addEntries(tokens.typography.fontSizes, "typography.fontSizes");
    if (tokens.typography.lineHeights) addEntries(tokens.typography.lineHeights, "typography.lineHeights");
  }
  if (tokens.code) addEntries(tokens.code as unknown as Record<string, unknown>, "code");

  return flat;
}

function tokenRefLookup(ref: string, flat: Record<string, string>): string {
  if (flat[ref] !== undefined) return flat[ref]!;
  if (flat[`colors.${ref}`] !== undefined) return flat[`colors.${ref}`]!;
  if (flat[`${ref}.default`] !== undefined) return flat[`${ref}.default`]!;
  if (flat[`colors.${ref}.default`] !== undefined) return flat[`colors.${ref}.default`]!;
  throw new Error(`Token reference "${ref}" not found`);
}

function resolvePathInFlat(
  path: string,
  flat: Record<string, string>,
  visited: Set<string>,
): string {
  if (visited.has(path)) {
    throw new Error(`Circular token reference detected: "${path}"`);
  }

  const value = flat[path];
  if (value === undefined) {
    throw new Error(`Token "${path}" not found`);
  }

  visited.add(path);

  const result = resolveStringValue(value, flat, visited);

  visited.delete(path);
  return result;
}

function resolveStringValue(
  str: string,
  flat: Record<string, string>,
  visited: Set<string>,
): string {
  let result = str;

  if (GLOBAL_DOLLAR_REF.test(result)) {
    GLOBAL_DOLLAR_REF.lastIndex = 0;
    result = result.replace(GLOBAL_DOLLAR_REF, (_match, path) => {
      return resolvePathInFlat(path, flat, visited);
    });
  }

  if (GLOBAL_BRACE_REF.test(result)) {
    GLOBAL_BRACE_REF.lastIndex = 0;
    result = result.replace(GLOBAL_BRACE_REF, (_match, path) => {
      return resolvePathInFlat(path, flat, visited);
    });
  }

  return result;
}

/** @internal */
export function hasTokenReferences(value: string): boolean {
  return DOLLAR_REF.test(value) || BRACE_REF.test(value);
}

/** @internal */
export function resolveFlatTokens(
  flat: Record<string, string>,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  const entries = Object.entries(flat);

  let changed = true;
  let iterations = 0;
  const maxIterations = entries.length * 2;

  const current = { ...flat };

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const [path, value] of Object.entries(current)) {
      if (resolved[path] !== undefined) continue;

      if (!hasTokenReferences(value)) {
        resolved[path] = value;
        changed = true;
        continue;
      }

      try {
        const resolvedValue = resolveStringValue(value, { ...current, ...resolved }, new Set());
        resolved[path] = resolvedValue;
        changed = true;
      } catch {
        // Dependencies not yet resolved — try again next iteration
      }
    }
  }

  for (const [path, value] of Object.entries(current)) {
    if (resolved[path] === undefined) {
      resolved[path] = resolveStringValue(value, { ...current, ...resolved }, new Set());
    }
  }

  return resolved;
}

/** @internal */
export function resolveValueReferences(
  value: string,
  flat: Record<string, string>,
): string {
  return resolveStringValue(value, flat, new Set());
}
