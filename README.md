# Theme Kit

The theming runtime for modern applications. Semantic tokens, theme families,
SSR-safe hydration, smooth transitions, scoped themes, and ecosystem adapters —
for React, Next.js, Vue, Nuxt, Svelte, Solid, Angular, Astro, Remix, and web
components.

[Documentation](https://theme-kit-dev.vercel.app) ·
[Playground](https://theme-kit-dev.vercel.app/playground) ·
[npm](https://www.npmjs.com/org/theme-kit) ·
[GitHub](https://github.com/themekit-dev/theme-kit)

## Install

```bash
# Core + React
npm install @theme-kit/core @theme-kit/react

# Core + Next.js
npm install @theme-kit/core @theme-kit/next

# CLI (developer tooling, install globally or as a devDependency)
npm install -g @theme-kit/cli
```

> Theme Kit packages ship **zero runtime dependencies** — frameworks are peer
> dependencies. Install only what your application actually uses.

## Quick Start

```tsx
// Next.js app router — app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="mint-light" initialMode="system">
      {children}
    </ThemeProvider>
  );
}
```

```tsx
// Any client component
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  return (
    <div>
      <span>{theme.name} | {mode}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setMode("light")}>Light</button>
      <button onClick={() => setMode("dark")}>Dark</button>
      <button onClick={() => setMode("system")}>System</button>
    </div>
  );
}
```

## Features

- **Theme families** — independent palette + mode switching (`mint-light`,
  `mint-dark`, `plum-light`, ...) from one `setFamily` / `setMode` API.
- **Semantic tokens** — recursive token groups, references, and expressions,
  mapped to CSS variables.
- **SSR-first zero flash** — fingerprint-guarded cookie persistence, server
  resolution, and a blocking bootstrap script in every framework.
- **ThemeScope** — isolate a subtree with its own theme, family, and local
  token definitions.
- **Transitions** — diff → plan → animate pipeline with reduced-motion support.
- **Scheduling** — sunrise/sunset theme switching (NOAA solar math) in every
  framework.
- **ThemeScrollbar** — a theme-colored overlay scrollbar with no layout shift.
- **9 adapters** — MUI, Chakra UI, Ant Design, Mantine, shadcn/ui, Bootstrap,
  DaisyUI, Open Props, UnoCSS.
- **CLI** — `theme-kit generate`, `validate`, `inspect`, `migrate`, `export`.

## Ecosystem

```
@theme-kit/core       Framework-agnostic runtime (store, adapters, utils)
@theme-kit/react      React hooks & provider
@theme-kit/next       Next.js App Router integration (SSR, cookies)
@theme-kit/vue        Vue 3 integration
@theme-kit/nuxt       Nuxt module (SSR, cookies, zero flash)
@theme-kit/svelte     Svelte 5 integration
@theme-kit/solid      SolidJS integration
@theme-kit/angular    Angular integration
@theme-kit/astro      Astro integration
@theme-kit/remix      Remix integration
@theme-kit/web        Web Components + vanilla
@theme-kit/tailwind   Tailwind CSS v4 plugin
@theme-kit/cli        Theme generator / validator / migrator
@theme-kit/*          MUI, Chakra, AntD, Mantine, shadcn, Bootstrap,
                      DaisyUI, Open Props, UnoCSS adapters
```

## Independent packages

Every Theme Kit package is independently installable:

- **Framework integrations don't pull in each other.** Installing
  `@theme-kit/next` brings Next + React support and nothing else — it does not
  install `@theme-kit/vue`, `@theme-kit/svelte`, or any adapter.
- **Adapters are opt-in.** The component-library adapters (`@theme-kit/mui`,
  `@theme-kit/chakra`, `@theme-kit/antd`, `@theme-kit/mantine`,
  `@theme-kit/shadcn`, `@theme-kit/bootstrap`, `@theme-kit/daisyui`,
  `@theme-kit/open-props`, `@theme-kit/unocss`) are separate packages, installed
  only when you explicitly want them. Their framework wrappers live behind
  subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional
  peers, so `import { useShadcnTheme } from "@theme-kit/shadcn/react"` works
  without installing Vue or Angular.
- **Core has zero runtime dependencies.** `@theme-kit/core` ships no
  `dependencies` and no `peerDependencies`; framework packages declare their
  framework as a peer and are installed only when your app actually uses them.

## CLI

```bash
theme-kit generate --seed "#6366f1" --family indigo
theme-kit validate themes/
theme-kit inspect themes/my-theme.json
theme-kit migrate themes/
```

See the [CLI documentation](https://theme-kit-dev.vercel.app/cli) for the
full command reference.

## Documentation

Full documentation: <https://theme-kit-dev.vercel.app>

- [Frameworks](https://theme-kit-dev.vercel.app/framework-guides)
- [API Reference](https://theme-kit-dev.vercel.app/api-reference)
- [Playground](https://theme-kit-dev.vercel.app/playground)
- [Known Limitations](https://theme-kit-dev.vercel.app/known-limitations)

## Contributing & Documentation Workflow

All user-facing docs live in this repo and are generated/guarded by scripts —
hand-editing generated output will be reverted by the release gate.

- **API reference** (`apps/docs/content/api-reference/**.md`) is **generated**:
  edit `docs/reference/capabilities.ts` (canonical capability registry +
  descriptions) and run `npm run docs:generate-api`. Never edit the `.md`
  output by hand.
- **Capability/contract handbook**: `docs/reference/README.md` (manual
  reference for maintainers) and `docs/reference/capabilities.ts` (the
  machine-readable source of truth).
- **Guides** (`apps/docs/content/*.md`, framework/adapter pages via
  `apps/docs/lib/frameworks.tsx` / `libraries.tsx`) are hand-written; snippets
  must import real shipped symbols (enforced by the snippet audit).
- **Before pushing docs or API changes**, run the release gate:

```bash
npm run docs:release-gate
```

It chains the public-API classification check, export inventory, snippet
baseline, audits B/C/E/F, and the §2/§3 page-contract audit. Audit C's dynamic
half (`node scripts/docs/audits/audit-c-examples.mjs --dynamic`) compiles every
canonical example against packed tarballs — run it when touching examples or
package entrypoints (needs network for peer installs). The browser smoke audit
(`scripts/docs/audits/audit-browser-smoke.mjs`) is a manual pre-release check
requiring a production docs build.

## License

[MIT](https://github.com/themekit-dev/theme-kit/blob/main/LICENSE)
