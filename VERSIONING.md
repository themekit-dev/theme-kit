# Versioning

## Release strategy

All `@theme-kit/*` packages release together at a **coherent version**. The public API contract between
`core`, the framework wrappers, and the adapters is aligned, so a mixed-version install is not a
supported configuration.

- Every package ships `1.0.0` at the initial release.
- A single version bump releases the whole set via changesets.
- Framework wrappers never bump alone for a breaking `core` change: `core` major forces the whole set.

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
