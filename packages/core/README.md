# @theme-kit/core
Framework-agnostic theming engine: theme store, runtime, transitions, scheduling, accessibility, and DOM adapters.
## Install
```bash
npm install @theme-kit/core
```
## Quick start

```js
import { createThemeStore, ThemeRuntime, createCSSVariablesBinding } from "@theme-kit/core";

const store = createThemeStore({
  themes: {
    light: { name: "light", tokens: { color: { background: "#ffffff" } } },
    dark: { name: "dark", tokens: { color: { background: "#0a0a0a" } } },
  },
});
const runtime = new ThemeRuntime({ store });
createCSSVariablesBinding(store);
```

## Subpaths

`./vanilla`, `./vite`, `./scrollbar.css`

## Documentation
Full API reference and guides: [Theme Kit docs](https://theme-kit-docs.vercel.app).
## License
MIT
