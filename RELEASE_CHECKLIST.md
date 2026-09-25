# Release Checklist

The maintainer procedure for preparing, verifying and publishing a Theme Kit
release. This is the checklist; the **enforced** gates are the scripts it names,
and `docs/reference/README.md` documents each one in full.

> **Releases are not lockstep.** Packages are organised into release groups
> (`.changeset/config.json` → `fixed`) and otherwise version **independently**, so
> a single release legitimately ships several versions side by side. See
> `VERSIONING.md` for the policy and `CHANGELOG.md` for the current release.

## 0. Decide the version boundary

Work out which packages actually changed their **public API** before choosing
numbers. A removed or renamed export is a MAJOR; new surface is a MINOR; a
bug fix is a PATCH (`VERSIONING.md` → Semver rules).

The reliable way to find removals is to diff the export surface against the last
released one, not to read the diff:

```bash
# Current surface (regenerated from the built .d.ts)
node scripts/release/export-inventory.mjs

# Removed exports pinned by the release being prepared
node scripts/release/verify-breaking-contract.mjs
```

- A package that lost exports → **MAJOR**, and it must be listed in
  `verify-breaking-contract.mjs` so the break stays pinned.
- A package whose only change is additive → **MINOR**.
- An unchanged package → leave it alone. Do not "normalise" the tree to one
  version; that is the thing the release groups exist to prevent.

Confirm the split before touching any `package.json`:

```bash
node -e "for (const d of require('fs').readdirSync('packages')) {}" # or review the matrix by hand
```

## 1. Prepare

- [ ] Bump `version` in each affected `package.json`.
- [ ] Add the changeset(s) under `.changeset/` describing the bump and the
      reason (a breaking `core` change must list every affected package).
- [ ] Write the package `CHANGELOG.md` entry — for a MAJOR, state the removed
      symbols and the migration path.
- [ ] Update the root `CHANGELOG.md`, and any page that states the version split
      (`apps/docs/app/migrating-to-2/page.tsx`, `apps/docs/lib/changelog.ts`,
      `apps/docs/lib/search-sections.ts`, `apps/docs/lib/version.ts`).
- [ ] Rebuild the packages so `dist/**` matches the new version:
      `cd packages/<name> && npm run build`.
- [ ] Regenerate the derived artifacts:
      `node scripts/release/export-inventory.mjs` ·
      `node scripts/docs/public-api.mjs` ·
      `node apps/docs/scripts/generate-package-graph.mjs` ·
      `node apps/docs/scripts/generate-api-reference.mjs`.

## 2. Verify — gates that must pass

Run these from the repository root. `docs:release-gate` runs the docs gates
sequentially (they share a temp report file, so do not parallelise them).

```bash
npm run release:audit        # audit-packages → audit-dependencies → export-inventory
                             #   → verify-breaking-contract → jsdoc-audit → snippet-audit
npm run docs:api:check       # generated API reference has not drifted
npm run docs:examples        # every documented snippet is complete
npm run docs:audit:b         # every public export has an API page + a destination
npm run docs:audit:c         # every example is consistent and every capability has one
npm run docs:audit:e         # no doc references an invented symbol
npm run docs:audit:f         # no doc references an @internal symbol
npm run docs:audit:g         # canonical vocabulary
npm run docs:page-contracts  # §2 IA + §3 page contracts
```

- [ ] Per-package tests: `cd packages/<name> && npm test` (vitest). Run them for
      every package that changed, plus `core`.
- [ ] Docs app: `cd apps/docs && npm run typecheck` and `npm run build`.
- [ ] `git diff --check` is clean.

`npm run docs:release-gate:full` adds the API-drift check, the offline example
verify, `next build` and the browser smoke (Audit H). `:all` adds the dynamic
consumer compile (`docs:audit:c:dynamic`, needs network + `pnpm`).

## 3. Verify the published artifacts

- [ ] `npm run release:pack` — `pack-verify.mjs` inspects every tarball: no
      `src/`, test or `node_modules` leakage, every `exports`/`bin` target
      resolves inside the tarball, no `./`-prefixed bin path, no `workspace:*`.
- [ ] `npm run release:consumer` — installs the real tarballs with npm in
      disposable apps and typechecks/builds them.
- [ ] `npm run release:test:deps` — the dependency matrix: a fresh project
      installing one package pulls only what the policy allows.
- [ ] `npm run verify:astro-readouts` · `npm run verify:react-first-paint` — the
      framework-specific behavioural checks.
- [ ] `node scripts/release/publish.mjs --dry-run` — order-aware publish
      rehearsal (topological: foundation → adapters → frameworks), correct
      order, `--access public`, no writes.

## 4. Publish

Only after every box above is ticked and the tree is intentionally reconciled.

- [ ] Confirm the docs URL / metadata are final
      (`apps/docs/lib/site.ts`, `scripts/release/normalize-package-metadata.mjs`).
- [ ] `node scripts/release/publish.mjs` (drop `--dry-run`). The script gates on
      `npm whoami` and publishes in dependency order.
- [ ] Tag and push: `git tag v<version> && git push --follow-tags`.
- [ ] Create the GitHub release from `CHANGELOG.md`.
- [ ] Verify the published versions on npm resolve, then re-run
      `npm run release:audit` against the tagged commit.

## Reference — the current release

Theme Kit **2.0.0** enforces the dependency-isolation contract. Adapter
framework bindings moved off the framework-package roots and off the adapter root
entries, which removed public exports from **12 packages**, so those ship 2.0.0.
The packages that did not break keep their own version:

| Version | Packages |
|---|---|
| `2.0.0` | astro, next, nuxt, remix, vue, svelte, solid, angular, shadcn, bootstrap, daisyui, open-props |
| `1.4.0` | core, web (foundation — they always move together) |
| `1.3.1` | react |
| `1.3.0` | antd, chakra, mantine, mui, adapters, unocss, cli, devtools, tailwind |

Read the migration guide at `/migrating-to-2` for the per-package break and the
replacement import paths.
