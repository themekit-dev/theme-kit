# `theme-kit generate`

Generate a complete theme from a single **seed color**. By default it derives
a light + dark pair; `--mode light|dark` writes a single theme.

```
theme-kit generate [options]
```

## Options

| Option      | Description                                                    | Default |
| ----------- | -------------------------------------------------------------- | ------- |
| `--seed <color>`    | Source color in hex (`#rrggbb`). The CLI checks this. | `#6366f1` |
| `--family <name>`   | Family name; becomes the theme name and label prefix. | `default` |
| `--mode <mode>`     | `light`, `dark`, or `both` (a pair). | `both` |
| `--code`    | Also generate a `tokens.code` syntax-highlighting palette (opt-in). | off |
| `--output <file>` | Write JSON to a file. Omit to print to stdin. | — |

> The CLI requires a hex seed (`#rrggbb`), e.g. `#6366f1`. In bash, zsh, and
> PowerShell the leading `#` starts a comment, so always quote the seed in a
> terminal: `--seed "#6366f1"`. Package managers (npm, pnpm, yarn) also run
> `package.json` scripts through a shell, so keep the quotes there too — the
> quotes are a shell concern, not part of the flag itself.

## What the generator derives

Given a seed, `generate` (via `generateTheme`) derives the full semantic color
set: `background`, `foreground`, `card`, `popover`, `primary`,
`primaryForeground`, `secondary`, `muted`, `accent`, destructive (with their
foregrounds), `border`, `input`, `ring`, plus a `radius.lg` scale. The same
model that builds the default presets is exposed here, so a generated family
fits the rest of Theme Kit.

## Light + dark pair (default)

```bash
theme-kit generate --seed "#6366f1" --family indigo --output theme.json
```

Writes:

```json
{
  "light": {
    "name": "indigo-light",
    "meta": {
      "family": "indigo",
      "mode": "light",
      "label": "Indigo Light",
      "order": 10
    },
    "tokens": {
      "colors": {
        "background": "#f8fafc",
        "foreground": "#0f172a",
        "card": "#ffffff",
        "cardForeground": "#0f172a",
        "popover": "#ffffff",
        "popoverForeground": "#0f172a",
        "primary": "#6366f1",
        "primaryForeground": "#ffffff",
        "secondary": "#e4e4f1",
        "secondaryForeground": "#0f172a",
        "muted": "#efeff5",
        "mutedForeground": "#64748b",
        "accent": "#c6c6ec",
        "accentForeground": "#0f172a",
        "destructive": "#ef4444",
        "destructiveForeground": "#ffffff",
        "success": "#22c55e",
        "successForeground": "#ffffff",
        "border": "#d9d9e8",
        "input": "#d9d9e8",
        "ring": "#6366f1"
      },
      "radius": {
        "lg": "8px"
      }
    }
  },
  "dark": {
    "name": "indigo-dark",
    "meta": {
      "family": "indigo",
      "mode": "dark",
      "label": "Indigo Dark",
      "order": 20
    },
    "tokens": {
      "colors": {
        "background": "#020617",
        "foreground": "#f8fafc",
        "card": "#0f172a",
        "cardForeground": "#f8fafc",
        "popover": "#0f172a",
        "popoverForeground": "#f8fafc",
        "primary": "#9596ea",
        "primaryForeground": "#020617",
        "secondary": "#060846",
        "secondaryForeground": "#f8fafc",
        "muted": "#050638",
        "mutedForeground": "#94a3b8",
        "accent": "#151651",
        "accentForeground": "#f8fafc",
        "destructive": "#f87171",
        "destructiveForeground": "#020617",
        "success": "#4ade80",
        "successForeground": "#020617",
        "border": "#080a5e",
        "input": "#080a5e",
        "ring": "#9596ea"
      },
      "radius": {
        "lg": "8px"
      }
    }
  }
}
```

## A single mode

```bash
theme-kit generate --seed "#6366f1" --family indigo --mode light \
  --output indigo-light.json
```

## Code tokens (opt-in)

Not every theme needs a syntax-highlighting palette. Pass `--code` to also
generate a `tokens.code` block — a cohesive set of `--theme-code-*` variables
(keyword, string, number, function, type, comment, …) derived from the seed
hue, with distinguishable light/dark variants:

```bash
theme-kit generate --seed "#6366f1" --family indigo --code \
  --output indigo.json
```

The generated `light.tokens.code` (dark mirrors it with inverted colors):

```json
"code": {
  "background": "#ffffff",
  "foreground": "#0f172a",
  "keyword": "#1b1ebc",
  "string": "#1c7d33",
  "number": "#a04a00",
  "function": "#1641d0",
  "type": "#0e6f73",
  "comment": "#64748b"
}
```

Without `--code` no `code` block is emitted, so themes stay lean.

## Print to stdout

```bash
theme-kit generate --seed "#10b981" --family mint
```

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | Generated (file written or printed). |
| `2`  | Invalid `--seed` or `--mode`. |

Next: [validate](/cli/validate).