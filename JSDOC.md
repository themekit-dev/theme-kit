# JSDoc / TSDoc Standard

> **Status: enforced.** `node scripts/release/jsdoc-audit.mjs` runs as part of
> `pnpm release:audit`. Missing top-level JSDoc on a public export is a hard
> failure; missing JSDoc on a public property/method is a warning.

## The principle

Treat JSDoc as the **machine-readable contract of the public API**, not as
random comments developers happened to write.

```
Source
  ↓
TSDoc/JSDoc      ← this document governs this layer
  ↓
TypeDoc
  ↓
API Reference
  ↓
IDE IntelliSense
```

Long-form guides live in `apps/docs` and explain *how to use* the API. JSDoc
explains *what a symbol means and what its contract is*. Keep them separate.

## The pipeline

```text
pnpm build
  ↓
TypeDoc  (apps/docs/scripts/generate-api-reference.mjs)
  ↓
export inventory  (scripts/release/export-inventory.mjs)
  ↓
JSDoc audit       (scripts/release/jsdoc-audit.mjs)
  ↓
snippet audit     (scripts/release/snippet-audit.mjs)
```

TypeDoc and the audit use the same TypeScript compiler program over the same
source entries, so there is one authoritative representation of the public API.

## Requirements — every public export

A **public export** is any function, class, interface, type alias, constant,
enum, React component, hook, Vue composable, Angular injectable/function,
adapter factory, exported option, or exported property that users configure
and that is not marked `@internal`.

Every public export MUST have a JSDoc comment containing:

1. **A one-sentence summary** (always first) describing the contract, not the
   implementation.
2. `@param` for every parameter (unless the parameter is self-evident from the
   name and the summary).
3. `@returns` when the return value is non-obvious or its semantics matter.
4. `@defaultValue` on optional configuration properties, instead of burying
   the default in prose.
5. `@example` for every non-trivial API (functions, hooks, composables,
   providers, factories).
6. `@remarks` for subtle behavior: lifecycle guarantees, SSR constraints,
   transition/scheduling participation, fallbacks.
7. `@throws` only when something genuinely throws, with the error type.
8. `@see` to connect closely related APIs (`{@link createThemeStore}`).
9. `@deprecated` with a replacement target and removal version — never a
   bare `// old` comment.
10. `@internal` on every implementation-only export so TypeDoc and the audit
    both exclude it.

Not every tag is required on every symbol. The summary is always required.

### Comment structure

```ts
/**
 * <One-sentence summary of the contract.>
 *
 * <Optional: semantics, edge cases, constraints.>
 *
 * @param x What x is and how it behaves.
 * @returns What the caller receives.
 *
 * @example
 * ```ts
 * // minimal working example
 * ```
 *
 * @remarks
 * Subtle behavior that only matters to advanced users.
 *
 * @see {@link createThemeStore}
 * @deprecated Use `newThing()` instead. Removed in the next major release.
 */
```

### Summaries describe behavior, not implementation

Good:

```ts
/** Applies the selected theme to the runtime. */
```

Bad:

```ts
/** Calls store.set and updates variables. */
```

### Depth hierarchy

| Level | Symbol type | Minimum |
| ----- | ----------- | ------- |
| 1 | Trivial constants | One sentence. |
| 2 | Normal APIs | Summary + `@param` + `@returns` + `@example` where useful. |
| 3 | Architectural APIs (`createThemeRuntime`, `ThemeProvider`, `ThemeScope`, `createThemeRoot`, scheduling, persistence, SSR bootstrap, adapter factories) | Summary + details + semantics + edge cases + example + `@remarks` + related APIs. |

### What is not JSDoc's job

JSDoc must NOT become the full documentation site. Do not write 700 lines
about theming architecture into a comment. Keep:

- **JSDoc** → API contract
- **Docs page** → conceptual explanation, tutorials, complete examples
- **README** → orientation + installation

## Package-specific requirements

- **Core** — highest density. Functions, classes, interfaces, types,
  constants, runtime methods, options, token groups, lifecycle semantics.
- **Framework integrations** — Provider, hooks/composables, framework
  components, SSR behavior, framework-specific options. Hooks must document
  *where they may be called* (e.g. "Must be called inside `ThemeProvider`",
  "Call inside Vue setup scope", "May be called from an Angular injection
  context").
- **Adapters** — factory, options, what the adapter changes, what it does not
  change, lifecycle, framework dependencies, and the factory/react-free
  boundary when applicable.
- **CLI** — exported programmatic helpers get JSDoc; the primary CLI
  documentation belongs in `docs/cli`.

## Specialized documentation requirements

- **Options interfaces** deserve property-level JSDoc with `@defaultValue` on
  every optional field (e.g. `ThemeRuntimeOptions`, `ThemeTransitionOptions`,
  `ThemeScrollbarOptions`, `ThemeScopeProps`, `ThemeScheduleOptions`,
  adapter/persistence options).
- **Lifecycle guarantees** must be explicit: idempotency, no-op-after-destroy,
  disposer semantics ("The returned disposer is deterministic and idempotent").
- **`destroy()`** must state idempotency and post-destruction behavior.
- **React `createThemeRoot()`** must state its CSR-only contract and that most
  applications should use `ThemeProvider` with the normal React root API.
- **`ThemeScope`** must state the nested-scope override contract, local-theme
  fallback, and the framework's actual reactivity behavior (e.g. the Svelte
  reactive-prop limitation).
- **Optional token groups** (e.g. `code`) must state that they are opt-in and
  that themes omitting them emit no CSS variables.

## Semi-public helpers

Symbols deliberately exported as low-level capabilities (`createThemeDiff`,
`createTransitionPlan`, `runThemeAnimation`, `evaluateExpression`,
`getContrastRatio`, `scanForTransition`, `mergeTokens`, `flattenTokens`,
`resolveTokens`) get real JSDoc. They are supported public capabilities, not
`// useful helper` comments.

## Terminology

Keep vocabulary identical everywhere: JSDoc, API reference, README, docs,
examples, and TypeScript types must use the same terms ("theme family",
"theme selection", "token group", …). Do not rename a concept in one layer.

## The final system

```text
                  PUBLIC API
                      │
                      ▼
                 TSDoc / JSDoc
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
  TypeScript       TypeDoc          IDE hover
      │               │
      ▼               ▼
  type safety      API reference
                      │
                      ▼
                 docs website
                      │
                      ▼
             examples / tutorials
```

```text
┌─────────────────────────────────────────┐
│ Theme Kit Release Validation             │
├─────────────────────────────────────────┤
│ exports              ✅                  │
│ subpaths             ✅                  │
│ types                ✅                  │
│ JSDoc coverage       ✅  ← this standard │
│ API reference        ✅                  │
│ examples             ✅                  │
│ snippets             ✅                  │
│ package tarballs     ✅                  │
│ external consumers   ✅                  │
└─────────────────────────────────────────┘
```

## Enforcement

The audit is intentionally strict on top-level exports and lenient on
properties so the bar can be tightened later:

| Check | Severity |
| ----- | -------- |
| Public function/class/interface/type alias/enum/const export without JSDoc | **failure** |
| Public property/method without JSDoc (interfaces, classes, object types) | warning (`--props=fail` to promote) |
| `@internal` export without docs | ok |
