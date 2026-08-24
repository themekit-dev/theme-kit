# `theme-kit inspect`

Print a human-readable summary of what is inside a theme: its name, family,
mode, token groups, and metadata. Useful for documentation, review, and
explaining a theme to a teammate.

```
theme-kit inspect <file> [options]
```

## Options

| Option      | Description                                              |
| ----------- | -------------------------------------------------------- |
| `--file <path>` | Theme file to inspect (or pass positionally). |

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

Next: [migrate](/cli/migrate).