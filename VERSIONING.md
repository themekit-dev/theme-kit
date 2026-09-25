# Versioning

## Release strategy

Packages are organised into **release groups** (`.changeset/config.json` → `fixed`). Only packages
that genuinely share a compatibility contract are versioned together; everything else versions
**independently**, so a break scoped to one integration does not force a major on unrelated packages.

Current groups:

| Group | Members | Why they move together |
|---|---|---|
| foundation | `@theme-kit/core`, `@theme-kit/web` | Shared primitives every other package builds on. |

Framework integrations, adapters and tooling are **not** grouped: `@theme-kit/astro` can ship a major
without dragging `@theme-kit/core`, `@theme-kit/react` or `@theme-kit/vue` into one.

### Internal dependency ranges

Internal workspace dependencies use **caret** ranges (`workspace:^`, published as `^x.y.z`), never
exact pins (`workspace:*`, published as `x.y.z`). An exact pin forces every dependent to republish on
every upstream release, which re-couples exactly the versions the release groups exist to decouple.
`audit-packages` fails on `workspace:*`.

### `core` is still the contract

`core` remains the shared contract: framework wrappers and adapters re-export its types. A breaking
`core` change is therefore breaking for every package that re-exports it, and **the changeset must say
so explicitly** — list each affected package with a `major` bump in the same changeset. Changesets
cannot infer this; `updateInternalDependencies` only rewrites the range and applies a patch bump.

Independent versioning makes mixed-version installs *possible*. The caret ranges plus this rule are
what keep them *compatible*.

### Peer dependencies

A declared peer is a compatibility claim, so it must be earned: every `peerDependencies` entry must be
either imported by `src/**` or referenced by the public `.d.ts`. Peers a consumer's app supplies at
runtime without the package importing them (`react-dom`, `tailwindcss`, `nuxt`, …) are listed with a
justification in `dependency-policy.json` → `companionPeers`. Anything else is an `unused-peer`
failure in `audit-dependencies`.

## Semver rules

Given `MAJOR.MINOR.PATCH`:

| Bump | When |
|---|---|
| **PATCH** | Bug fixes, internal refactors, documentation-only changes, dependency updates that preserve behavior. No public API change, no behavior change for consumers. |
| **MINOR** | New public API surface or new behavior that is backward compatible: new exports, new framework packages, new adapter hooks, new token groups, optional options. Existing consumers keep compiling and behaving identically. |
| **MAJOR** | Any breaking change: removed/renamed exports, changed signatures or option shapes, changed default behavior, changed framework peer ranges, dropped runtime support (e.g. minimum Node/browser version), or changes to the cookie/storage contract that affect the zero-flash SSR story. |

### Additional rules

- **`@theme-kit/core` is the contract.** A breaking change in core is a major for every package that
  re-exports or depends on it (`react`, `next`, `vue`, `nuxt`, `svelte`, `solid`, `angular`, `astro`,
  `remix`, `web`, `tailwind`, `cli`, `devtools`, all adapters). This is intentional: consumers get one
  version to reason about.
- **New adapters / new subpaths** (`/factory`, `./xxx.css`) are MINOR — they add surface without
  changing existing behavior.
- **The CLI exit-code contract** (0 OK / 1 error / 2 usage / 3 validation-failed) and the **cookie
  contract** (`theme-name`, `theme-family`, `theme-mode`, `theme-fingerprint`) are stable public
  contracts. Changing them is a MAJOR.
- **Dev-time compatibility** with framework majors (React 19, Vue 3, Svelte 5, etc.) is documented via
  `peerDependencies`. Raising a peer range is a MAJOR.

## Changelog

Changes are tracked per-package via changesets and aggregated in each package's `CHANGELOG.md` at
release time. See `CHANGELOG.md` for the release history.

## `@internal` convention

Implementation helpers that are exported for internal wiring but are **not** part of the intended
public contract are marked `/** @internal */` in source. This:

- removes them from the generated API reference (typedoc `--excludeInternal`), tightening the
  documented contract;
- does **not** remove them from the compiled package — consumers can still import them, but they
  are undocumented by design;
- is tracked in `scripts/release/api-manifest.json` (the `internal` split) and respected by the
  `export-inventory` docs-drift check.

Before adding `@internal` to a symbol, confirm it isn't taught as a feature anywhere in the docs
guides (snippet or prose). If a guide references it, it is public — document it instead.
