# `theme-kit export`

Export theme tokens to **CSS variables** or a **flat JSON map** for another
system. Every token becomes a `--theme-*` custom property, so the exported CSS
needs no runtime and no framework — Tailwind, shadcn/ui, daisyUI, and
hand-written CSS can all consume the variables.

```
theme-kit export <file> [options]
```

## Options

| Option      | Description                                              |
| ----------- | -------------------------------------------------------- |
| `--file <path>`   | Theme file to export (or pass positionally). |
| `--format <fmt>`  | `css` or `json`. Defaults to `css`. |
| `--output <file>` | Write the export to a file instead of stdout. |

## CSS variables

A single theme:

```bash
theme-kit export theme.json --format css --output theme.css
```

```css
:root {
  --theme-color-background: #f8fafc;
  --theme-color-primary: #6366f1;
}
```

A light + dark pair exports both blocks:

```css
:root {
  /* light */
}

.dark, [data-theme="dark"] {
  /* dark */
}
```

```css
@import "./theme.css"; /* :root plus the .dark block */
```

## JSON

```bash
theme-kit export theme.json --format json
```

Emits the flat `--theme-*` key/value map as JSON — useful for editors, scripts,
or configuration systems that consume token maps.

## Default output

Omit `--output` to print the CSS (or JSON) to stdout.

## Exit codes

| Code    | Meaning |
| ------- | ------- |
| `0`     | Exported successfully. |
| `2`     | Invalid arguments (missing file or unknown format). |