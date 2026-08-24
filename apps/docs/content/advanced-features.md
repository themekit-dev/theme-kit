## Live Theme Generation

`generateTheme()` produces a complete light + dark theme pair from a single seed hex color. It converts the seed to HSL, then derives secondary, muted, accent, border, and ring colors by adjusting saturation and lightness — low saturation for muted tones, shifted hue for accent, and the raw seed for `primary`/`ring`.

```ts
import { generateTheme, mergeTokens } from "@theme-kit/core";

const { light, dark } = generateTheme({ seed: "#6366f1", family: "indigo" });

// Override defaults — mergeTokens deep-merges partial tokens into the generated theme
const customLight = {
  ...light,
  tokens: mergeTokens(light.tokens, {
    radius: { lg: "14px" },
    colors: { destructive: "#dc2626" },
  }),
};
```

The `family` parameter controls the theme name prefix (`"indigo-light"` / `"indigo-dark"`); omit it and the default is `"generated"`. Contrast-aware foregrounds are computed via WCAG relative luminance — `primaryForeground` gets white or dark ink based on the seed's lightness.

## Theme Validation

`validateTheme()` checks that every required semantic color token is defined. Pass a theme list to resolve `extends` chains before validation.

```ts
import { validateTheme } from "@theme-kit/core";

const result = validateTheme(childTheme, { themes: [baseTheme, childTheme] });
// { valid: boolean, issues: [{ type: "missing", path: "colors.destructive", message: "..." }] }
```

The required color keys are: `background`, `foreground`, `card`, `cardForeground`, `popover`, `popoverForeground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `destructive`, `destructiveForeground`, `success`, `successForeground`, `border`, `input`, `ring`.

Use in CI:

```ts
import { getBuiltInThemes, validateTheme } from "@theme-kit/core";

const themes = getBuiltInThemes();
const failures = themes
  .map((t) => ({ name: t.name, ...validateTheme(t) }))
  .filter((r) => !r.valid);

if (failures.length > 0) {
  console.error("Validation failures:", failures);
  process.exit(1);
}
```

## Theme Migration

Version your themes with a linear migration chain. `registerMigration()` declares a step between two versions; `migrateTheme()` walks the chain from the current version to the target.

```ts
import { registerMigration, migrateTheme } from "@theme-kit/core";

registerMigration({
  from: "1.0.0",
  to: "2.0.0",
  description: "Rename primaryColor to primary",
  remapColors: [{ from: "primaryColor", to: "primary" }],
});

registerMigration({
  from: "2.0.0",
  to: "3.0.0",
  description: "Add success token",
  migrate(theme) {
    return {
      ...theme,
      tokens: {
        ...theme.tokens,
        colors: {
          ...theme.tokens?.colors,
          success: "#22c55e",
          successForeground: "#ffffff",
        },
      },
    };
  },
});

const migrated = migrateTheme(oldTheme, { targetVersion: "3.0.0" });
```

`remapColors` handles simple key renames; `migrate` handles arbitrary transforms. The chain is walked linearly (max 20 steps) — the `from` version of each step must equal the `to` of the previous one.

## Token Resolution Deep Dive

Tokens support three kinds of dynamic values, resolved lazily by `resolveTokens()`:

**References** — `$colors.primary` or `{colors.primary}` point to another token. Circular references throw.

```ts
tokens: {
  colors: {
    primary: "#6366f1",
    ring: "$colors.primary",
    cardForeground: "{colors.primary}",
  },
}
```

**Expressions** — numeric math evaluated at resolve time.

```ts
spacing: { "12": "calc(3rem + 0.75rem)" }
```

**Derived colors** — `contrast()` returns black/white by WCAG luminance; `auto()` derives a readable foreground from a sibling.

```ts
tokens: {
  colors: {
    primary: "#6366f1",
    primaryForeground: "auto()",           // white or dark ink based on primary
    muted: "#f1f5f9",
    mutedForeground: "contrast(muted)",    // black on light, white on dark
  },
}
```

Resolution walks the token tree — references first, then expressions, then derived calls. Utilities:

```ts
import { flattenTokens, resolveFlatTokens, resolveTokens, hasTokenReferences } from "@theme-kit/core";

const flat = flattenTokens(myTheme.tokens);       // { "colors.primary": "#6366f1", ... }
const resolved = resolveFlatTokens(flat);          // resolves all refs in place
const deep = resolveTokens(myTheme.tokens);        // returns a new ThemeTokens tree
const hasRefs = hasTokenReferences("$colors.primary"); // true
```

## Plugin Authoring

Plugins implement the `ThemePlugin` interface and are registered via the `plugins` option or `runtime.registry.use()`.

```ts
import type { ThemePlugin } from "@theme-kit/core";

const watermarkPlugin: ThemePlugin = {
  name: "watermark",
  priority: 10,               // lower runs first

  onRuntimeCreated(runtime) {
    // access runtime.store, runtime.selection, etc.
  },

  transformTokens(tokens, { theme }) {
    // inject a derived token into every theme
    return {
      ...tokens,
      colors: {
        ...tokens.colors,
        watermark: `${tokens.colors?.primary ?? "#000"}22`,  // 10% opacity
      },
    };
  },

  onAfterThemeChange({ theme }) {
    console.log(`[watermark] applied: ${theme.name}`);
  },

  onDestroy() {
    // cleanup
  },
};
```

Priority controls execution order — lower numbers run first. `transformTokens` is called for every theme change and receives the merged token tree; it must return the modified tree. Plugins can be added/removed at runtime:

```ts
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  plugins: [watermarkPlugin],
});
```

## runtime.update()

`update()` merges partial tokens into the current live theme without replacing it. The merge is deep — nested color objects are merged recursively, then all plugins' `transformTokens` run, and the result is resolved.

```ts
// live-edit: override just the primary color
runtime.update({
  colors: { primary: "#f97316" },
});

// override multiple groups at once
runtime.update({
  colors: { primary: "#f97316", accent: "#eab308" },
  radius: { lg: "20px" },
});
```

This triggers the full lifecycle: `beforeThemeChange` → store update → `beforePersist` → `afterPersist` → `afterThemeChange`.

## runtime.snapshot() / restore()

Capture the entire runtime state — current theme, selection, history, and registry — then restore it later. Useful for undo/redo implementations, test fixtures, or time-travel debugging.

```ts
// capture
const snap = runtime.snapshot();
// snap: { theme, selection: { mode, family }, history: [...], registry: { themes: [...] } }

// ... user makes changes ...

// restore
runtime.restore(snap);
```

Both use `structuredClone` internally, so the snapshot is a deep copy — mutations to the snapshot don't affect the live runtime.

## runtime.batch()

Batch coalesces multiple store writes into a single lifecycle cycle. Without `batch`, each `set` or `update` triggers the full event chain.

```ts
runtime.batch(() => {
  runtime.update({ colors: { primary: "#f97316" } });
  runtime.selection.setFamily("ocean");
  runtime.selection.setMode("dark");
});
// single beforeThemeChange / afterThemeChange pair
```

If any intermediate state would be invalid, the batch still completes — there's no rollback. Use it when you know the final state is correct but don't want intermediate renders.

## Theme Packs

A theme pack is a named bundle of themes. `runtime.use()` installs the pack — every theme it contains is tagged `pack:<name>` in its meta.

```ts
const brandPack = {
  name: "brand",
  themes: [
    defineTheme({ name: "brand-light", meta: { family: "brand", mode: "light" }, tokens: { ... } }),
    defineTheme({ name: "brand-dark", meta: { family: "brand", mode: "dark" }, tokens: { ... } }),
  ],
};

runtime.use(brandPack);

// themes are now available for selection
runtime.selection.setFamily("brand");
runtime.selection.setMode("dark");
```

Under the hood, `runtime.use()` delegates to `registry.use()`, which registers every theme in the pack and stamps the `pack:brand` tag. The registry's `getThemesByFamily` and `getFamilies` methods immediately reflect the new themes.

## Accessibility Profiles

`getAccessibilityProfiles()` returns pre-built high-contrast and large-text themes. `simulateCVD()` and `simulateThemeForCVD()` model how a theme appears under color vision deficiencies.

```ts
import {
  getAccessibilityProfiles,
  simulateCVD,
  simulateThemeForCVD,
  getCVDLabel,
  validateThemeContrast,
} from "@theme-kit/core";

// pre-built accessibility themes
const profiles = getAccessibilityProfiles();
// [high-contrast-light, high-contrast-dark, large-text-light, large-text-dark]

// simulate how a color looks under deuteranopia
const simulated = simulateCVD("#6366f1", "deuteranopia");

// simulate an entire theme
const deutTheme = simulateThemeForCVD(myTheme, "deuteranopia");

// audit every foreground/background pair
const audit = validateThemeContrast(myTheme);
// { valid: boolean, checks: [{ foregroundToken, backgroundToken, ratio,
//   passesAANormal, passesAALarge, passesAAANormal, passesAAALarge }] }
```

CVD types: `"protanopia"` (red-blind), `"deuteranopia"` (green-blind), `"tritanopia"` (blue-blind), `"achromatopsia"` (total color blindness).

Use `validateThemeContrast` in CI to catch regressions:

```ts
const result = validateThemeContrast(theme);
if (!result.valid) {
  for (const check of result.checks.filter((c) => !c.passesAALarge)) {
    console.error(
      `${check.foregroundToken} on ${check.backgroundToken}: ` +
        `${check.ratio.toFixed(2)}:1 (fails AA large text)`,
    );
  }
  process.exit(1);
}
```
