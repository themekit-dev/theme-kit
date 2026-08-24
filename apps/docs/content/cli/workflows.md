# Theme workflows

The CLI is a small, composable toolkit. The five commands chain into a real
authoring loop you can run in a terminal or a pipeline.

## The authoring loop

```text
1. Generate ── seed → theme.json
2. Edit ── tweak tokens by hand
3. Validate ── `theme-kit validate themes/`
4. Inspect ── review what changed
5. Commit ── git
6. CI validates ── on every push / PR
7. Ship ── merge, deploy
8. Migrate later ── when the schema changes
```

```bash
theme-kit generate --seed "#10b981" --family mint --output themes/mint.json
theme-kit validate themes/
theme-kit inspect themes/mint-light.json
```

```text
Git ─→ PR ─→ CI validate ─→ merge
```

## Generate then validate

Always validate right after a generate or an edit. A theme can be complete
yet fail contrast; catch it before it reaches an app.

```bash
theme-kit generate --seed "#6366f1" --family indigo --output theme.json
theme-kit validate theme.json || echo "fix before commit"
```

## Light / dark pairs

`--mode both` (default) writes a pair. Many apps want only one mode; generate
a single theme with `--mode light|dark` when you prefer.

## Migrate legacy themes

Schemas change. Keep `migrate` in your maintenance runbook:

```bash
theme-kit migrate themes/legacy.json --output themes/current.json
```

Print to stdout (drop `--output`) to diff the migration before accepting it.

## Export for another system

`export` is where the CLI becomes a bridge:

```text
Theme Kit theme ─→ export ─→ CSS variables / JSON map
```

```bash
theme-kit export theme.json --format css --output theme.css
```

The CSS variables apply with **no runtime** — Tailwind, shadcn/ui, daisyUI,
and any hand-written stylesheet consume them directly.

## The CLI + your framework

```text
            THEME KIT
                 │
   Runtime         CLI         Documentation
     │             │
     │     ┌───────┼────────┐
     │     │       │        │
     │  generate validate migrate
     │             │
     └─────────────┼───────────────
                   │
                 theme.json
```

A theme generated in the terminal is the same object a provider consumes:

```tsx
import { ThemeProvider } from "@theme-kit/react";
const themes = [light, dark];
```

## Related

- [Custom Themes](/custom-themes) — author a theme by hand.
- [Adapters](/adapters) — map runtime tokens to MUI, shadcn, Bootstrap.
- [CI & Automation](/cli/ci) — run validate in a pipeline.