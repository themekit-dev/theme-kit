# `theme-kit migrate`

## Prerequisites
- Node.js 22+
- Theme file(s) with legacy versions to migrate
- Project with @theme-kit/cli installed or npx access

Migrate a legacy theme to the current Theme Kit format. Theme schemas evolve;
`migrate` (via `migrateTheme`) applies the registered version migrations so a
theme from an older format still loads today.

<!-- cli-command:generated:start -->
## Synopsis

Migrates a legacy theme file to the current Theme Kit format.

```text
Usage:
  theme-kit migrate <file> [options]
```

## Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `--file <path>` | Legacy theme file to migrate (or pass positionally) | — |
| `--output <file>` | Write the migrated theme to a file | — |

> Generated from `packages/cli/src/cli.ts` — the same text `theme-kit migrate --help` prints.
<!-- cli-command:generated:end -->
## Examples

```bash
# Migrate a single legacy theme
theme-kit migrate themes/legacy.json

# Migrate and write the current format to a new file
theme-kit migrate \
  themes/legacy.json \
  --output themes/current.json
```

Without `--output`, the migrated JSON is printed to stdout — use it to diff
what changed before overwriting the original.

## What migrations cover

The migration layer understands source and target versions, token renames,
color remapping, and arbitrary transforms. `migrate` runs every registered
migration between the file's version and the current schema. Back up your
themes before a bulk migration.

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | Migrated (file written or printed). |
| `1`  | Migrating the file failed. |
| `2`  | No theme file supplied. |

## Next Steps
- [Export migrated tokens](./export)
- [Validate migrated themes](./validate)
- [CLI reference](./reference)

## Related
- [Theme Kit Quick Start](../quickstart)
- [Migration Docs](../../migration)
- [API Reference](../../api-reference)

Next: [export](/cli/export).
