# CLI Quick Start

A complete five-minute workflow: generate a theme from a seed, validate it,
inspect it, and export CSS variables — then wire the JSON into a Theme Kit
provider.

## 1. Install

```bash
npm install -g @theme-kit/cli
# or, without installing:
npx --yes @theme-kit/cli ...
```

## 2. Generate

Derive a complete **light + dark pair** from one seed color:

```bash
theme-kit generate \
  --seed "#6366f1" \
  --family indigo \
  --output theme.json
```

`--family` becomes the theme name and label prefix (`indigo-light`,
`indigo-dark`). The generator also derives the secondary, muted, accent,
border, ring, destructive, and background/foreground colors from the seed.

Omit `--output` to print the JSON to stdout, or ask for one mode only:

```bash
theme-kit generate --seed "#6366f1" --mode light --output light.json
theme-kit generate --seed "#6366f1" --mode dark  --output dark.json
```

The default `--mode both` writes a `{ light, dark }` pair.

## 3. Validate

```bash
theme-kit validate theme.json
# ✓ Theme is valid: indigo-light + indigo-dark
```

`validate` checks the schema, required semantic tokens, inheritance,
references, and contrast. It returns exit code `3` when validation fails:

```bash
theme-kit validate theme.json
# ✗ Theme is invalid: indigo-dark
#   - Missing token: `colors.primary`
```

## 4. Inspect

```bash
theme-kit inspect theme.json
# Theme 1: indigo-light
# Mode: light
# Family: indigo
# Tokens:
#   colors: 21 items
```

## 5. Export for another system

```bash
theme-kit export theme.json --format css --output theme.css
```

```css
:root {
  --theme-color-background: #f8fafc;
  --theme-color-primary: #6366f1;
}
```

## 6. Bring the theme into your app

The JSON the CLI writes is exactly what a provider consumes:

```tsx
// React / Next.js
import { ThemeProvider } from "@theme-kit/react";
import raw from "./theme.json";

const themes = raw.light ? [raw.light, raw.dark] : [raw];

export function App() {
  return <ThemeProvider themes={themes} defaultTheme="light">{/* UI */}</ThemeProvider>;
}
```

See [Commands](/cli/generate) for each command's options, or
[Workflows](/cli/workflows) for a full authoring loop.