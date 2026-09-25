# Theme Kit · Examples

Vite-based example apps for every Theme Kit framework integration. Each example
implements the **exact setup snippet from the docs** (`apps/docs/content/framework-guides.md`)
so the documented API is exercised end-to-end in a real app.

| Example      | Framework            | Package                  | Vite plugin(s)                          |
| ------------ | -------------------- | ------------------------ | --------------------------------------- |
| `react/`     | React 19             | `@theme-kit/react`       | `@vitejs/plugin-react`                  |
| `vue/`       | Vue 3                | `@theme-kit/vue`         | `@vitejs/plugin-vue`                    |
| `svelte/`    | Svelte 5             | `@theme-kit/svelte`      | `@sveltejs/vite-plugin-svelte`          |
| `solid/`     | Solid                | `@theme-kit/solid`       | `vite-plugin-solid`                     |
| `angular/`   | Angular              | `@theme-kit/angular`     | `@analogjs/vite-plugin-angular`         |
| `web/`       | Web Components       | `@theme-kit/web`         | —                                       |
| `tailwind/`  | Tailwind CSS v4      | `@theme-kit/tailwind`    | `@tailwindcss/vite`                     |
| `astro/`     | Astro                | `@theme-kit/astro`       | `@astrojs/react` (React islands)        |
| `nuxt/`      | Nuxt 3               | `@theme-kit/nuxt`        | Nuxt module (no Vite plugin)            |
| `remix/`     | Remix v2 + Vite      | `@theme-kit/remix`       | `@remix-run/dev` (Vite)                 |

The Vite-family apps also use `@theme-kit/core/vite` (`themeKitVitePlugin`) to
inject the blocking theme bootstrap script into the built `index.html` so the
persisted selection is applied before first paint. The SSR frameworks
(`astro`, `nuxt`, `remix`) get their zero-flash bootstrap from their own
server-side integration instead (`provider.astro` / the Nuxt module plugin /
`<ThemeHead>` + `getInitialThemeState`).

## Usage

```bash
# From the repo root: install everything (workspace links `@theme-kit/*`)
pnpm install

# Run a single example
pnpm --filter @theme-kit/example-react dev      # http://localhost:5173
pnpm --filter @theme-kit/example-vue dev
pnpm --filter @theme-kit/example-svelte dev
pnpm --filter @theme-kit/example-solid dev
pnpm --filter @theme-kit/example-angular dev
pnpm --filter @theme-kit/example-web dev
pnpm --filter @theme-kit/example-tailwind dev
pnpm --filter @theme-kit/example-astro dev      # http://localhost:4321
pnpm --filter @theme-kit/example-nuxt dev       # http://localhost:3000
pnpm --filter @theme-kit/example-remix dev      # http://localhost:5173

# Type-check + production build
pnpm --filter @theme-kit/example-react build
# ... same for the others

# Build every example
pnpm --filter theme-kit-examples build:all
```

Each example shows a theme switcher button that toggles between the `mint-light`
and `mint-dark` themes and re-renders reactively using the framework's Theme Kit
hook (or web component / vanilla runtime).
