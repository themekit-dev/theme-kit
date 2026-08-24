# `theme-kit migrate`

Migrate a legacy theme to the current Theme Kit format. Theme schemas evolve;
`migrate` (via `migrateTheme`) applies the registered version migrations so a
theme from an older format still loads today.

```
theme-kit migrate <file> [options]
```

## Options

| Option            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `--file <path>`   | Legacy theme file to migrate (or pass positionally). |
| `--output <file>` | Write the migrated theme to a new file.             |

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

Next: [export](/cli/export).