/**
 * Indexes used by the docs audits: entrypoints from the generated
 * classification, specifier resolution, and the registry lookup that answers
 * "may a page reference this symbol from this package?".
 */

import { packageNames } from "./registry.mjs";

/** Every enumerable entrypoint, keyed `pkg|entrypoint`. */
export function entrypointsOf(classification) {
  const map = new Map();
  for (const pkg of packageNames(classification)) {
    for (const [entry, row] of Object.entries(classification[pkg])) {
      map.set(`${pkg}|${entry}`, row);
    }
  }
  return map;
}

/** Entrypoints with no TypeScript surface (CSS files, `.astro` components). */
export function assetEntrypointsOf(classification) {
  const out = new Map();
  for (const s of classification.$meta?.skippedEntrypoints ?? []) {
    out.set(`${s.package}|${s.entrypoint}`, s.reason);
  }
  return out;
}

/**
 * Splits a module specifier (`@theme-kit/astro/client`) into base package plus
 * entrypoint key. Returns null when the package/entrypoint is not shipped, so
 * the caller can report an invented import.
 */
export function resolveSpecifier(classification, specifier) {
  let base = null;
  for (const candidate of packageNames(classification)) {
    if (specifier === candidate || specifier.startsWith(`${candidate}/`)) {
      if (!base || candidate.length > base.length) base = candidate;
    }
  }
  if (!base) return null;
  const entry = specifier === base ? "." : `.${specifier.slice(base.length)}`;
  const key = `${base}|${entry}`;
  const known = entrypointsOf(classification).get(key);
  const assetReason = assetEntrypointsOf(classification).get(key);
  if (!known && !assetReason) return null;
  return { pkg: base, entry, specifier, isAsset: !known && Boolean(assetReason), assetReason };
}

/**
 * Registry lookup: `pkg|symbol` -> keys that list it. `integrations[*].mirrors`
 * expands coverage to the packages an integration re-exports (e.g.
 * `@theme-kit/nuxt` re-exports core + vue), so the registry does not have to
 * enumerate hundreds of mirrored names.
 */
export function registryIndex({ capabilities, integrations }) {
  const byPkg = new Map(); // pkg -> Map(symbol -> sources[])

  const add = (pkg, symbol, source) => {
    if (!byPkg.has(pkg)) byPkg.set(pkg, new Map());
    const symbols = byPkg.get(pkg);
    if (!symbols.has(symbol)) symbols.set(symbol, []);
    if (!symbols.get(symbol).includes(source)) symbols.get(symbol).push(source);
  };

  for (const [key, cap] of Object.entries(capabilities)) {
    for (const [pkg, symbols] of Object.entries(cap.packages ?? {})) {
      for (const symbol of symbols) add(pkg, symbol, `capability:${key}`);
    }
  }
  for (const [key, integration] of Object.entries(integrations)) {
    for (const [pkg, symbols] of Object.entries(integration.packages ?? {})) {
      for (const symbol of symbols) add(pkg, symbol, `integration:${key}`);
    }
  }

  for (const [key, integration] of Object.entries(integrations)) {
    const mirrored = integration.mirrors ?? [];
    if (!mirrored.length) continue;
    const own = Object.keys(integration.packages ?? {});
    const target = own.length ? own[0] : `@theme-kit/${key}`;
    for (const source of mirrored) {
      const symbols = byPkg.get(source);
      if (!symbols) continue;
      for (const [symbol] of symbols) add(target, symbol, `integration:${key} <- ${source}`);
    }
  }

  const flat = new Map();
  for (const [pkg, symbols] of byPkg) {
    for (const [symbol, sources] of symbols) flat.set(`${pkg}|${symbol}`, sources);
  }
  return flat;
}

/** True when the symbol exists somewhere in the registry for that package. */
export function registryLists(index, pkg, symbol) {
  return index.get(`${pkg}|${symbol}`) ?? null;
}