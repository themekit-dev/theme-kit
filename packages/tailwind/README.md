# @theme-kit/tailwind

Tailwind CSS v4 integration that maps every semantic token to utilities and `@theme` variables.

## Reference snippet

```css
@import "tailwindcss";
@import "@theme-kit/tailwind";

body {
  @apply bg-background text-foreground;
}

.card {
  @apply bg-card text-card-foreground border-border;
}

.btn-primary {
  @apply bg-primary text-primary-foreground;
}
```

## Integration

- `@import "@theme-kit/tailwind"` maps tokens to `--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*` `@theme` variables.
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))` — scoped to the `.dark` class Theme Kit maintains.
- `synchronizeDarkClass(theme)` keeps the `.dark` class in sync with the active theme.
- Ships `theme.css`, `dark.css` and `preflight.css` layers.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
