# `theme-kit inspect`

## Prerequisites
- Node.js 22+
- Theme JSON file(s) to inspect
- Project with @theme-kit/cli installed or npx access

Print a human-readable summary of what is inside a theme: its name, family,
mode, token groups, and metadata. Useful for documentation, review, and
explaining a theme to a teammate.

<!-- cli-command:generated:start -->
## Synopsis

Prints a human-readable summary of a theme's meta, token groups, and references.

```text
Usage:
  theme-kit inspect <file> [options]
```

## Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `--file <path>` | Theme file to inspect (or pass positionally) | — |

> Generated from `packages/cli/src/cli.ts` — the same text `theme-kit inspect --help` prints.
<!-- cli-command:generated:end -->
## Examples

```bash
theme-kit inspect themes/plum-dark.json
theme-kit inspect theme.json    # a light + dark pair
```

## Output

For a single theme:

```
Theme: plum-dark
Mode: dark
Family: plum

Tokens:
  colors: 22 items
  radius: 1 items

Meta:
  Label: Plum Dark
  Description: N/A
  Version: N/A
```

For a `{ light, dark }` pair, each theme is printed with its own index:

```text
Theme 1: indigo-light
Mode: light
Family: indigo
...
Theme 2: indigo-dark
```

`inspect` summarizes token groups by count. To see the full token values,
use `export --format json` or read the JSON directly.

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | Inspected successfully. |
| `1`  | File not found / unreadable. |
| `2`  | No theme file supplied. |

## Next Steps
- [Migrate themes to new schema](./migrate)
- [Export current tokens](./export)
- [Validate theme structure](./validate)
- [CLI reference](./reference)

## Related
- [Theme Kit Quick Start](../quickstart)
- [Custom Themes](../../custom-themes)
- [API Reference](../../api-reference)

Next: [migrate](/cli/migrate).
