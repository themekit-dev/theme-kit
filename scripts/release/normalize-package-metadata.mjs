#!/usr/bin/env node
/**
 * Normalize package metadata for the Theme Kit 1.0.0 release (checklist item 19/20).
 *
 * For every publishable workspace package:
 *  - fills in missing description / repository / homepage / bugs / keywords
 *  - copies the root LICENSE into the package
 *  - generates a concise README.md if missing
 *  - removes `private: true` from packages that must be published
 *  - adds engines for node-run packages
 *
 * Idempotent: existing values are preserved.
 *
 * Usage: node scripts/release/normalize-package-metadata.mjs
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const REPO_URL = "https://github.com/thememk/theme-kit";
// TODO(1.0.0): after the first Vercel deployment, replace this with the real
// .vercel.app URL (keep it in sync with apps/docs/lib/site.ts SITE_URL, and
// the README). Set once — it becomes the `homepage` of every published package.
const DOCS_URL = "https://theme-kit-docs.vercel.app";

const DESCRIPTIONS = {
  "@theme-kit/core":
    "Framework-agnostic theming engine: theme store, runtime, transitions, scheduling, accessibility, and DOM adapters.",
  "@theme-kit/web": "Vanilla JS theme runtime and DOM bindings for Theme Kit.",
  "@theme-kit/react": "React bindings for Theme Kit: provider, hooks, and runtime access.",
  "@theme-kit/next": "Next.js integration for Theme Kit with SSR-first theming and zero-flash bootstrapping.",
  "@theme-kit/vue": "Vue 3 bindings for Theme Kit.",
  "@theme-kit/nuxt": "Nuxt module for Theme Kit: SSR, cookies, and zero-flash theming.",
  "@theme-kit/svelte": "Svelte 5 bindings for Theme Kit.",
  "@theme-kit/solid": "SolidJS bindings for Theme Kit.",
  "@theme-kit/angular": "Angular integration for Theme Kit.",
  "@theme-kit/astro": "Astro integration for Theme Kit.",
  "@theme-kit/remix": "Remix integration for Theme Kit.",
  "@theme-kit/tailwind": "Tailwind CSS v4 plugin that maps Theme Kit tokens to Tailwind theme variables.",
  "@theme-kit/cli": "Theme Kit CLI: generate, validate, inspect, and migrate themes.",
  "@theme-kit/devtools": "Development tools and runtime inspector for Theme Kit.",
  "@theme-kit/mantine": "Mantine adapter for Theme Kit.",
  "@theme-kit/adapters": "Shared adapter utilities for the Theme Kit adapter ecosystem.",
  "@theme-kit/mui": "MUI adapter for Theme Kit.",
  "@theme-kit/chakra": "Chakra UI adapter for Theme Kit.",
  "@theme-kit/antd": "Ant Design adapter for Theme Kit.",
  "@theme-kit/shadcn": "shadcn/ui adapter for Theme Kit.",
  "@theme-kit/bootstrap": "Bootstrap adapter for Theme Kit.",
  "@theme-kit/daisyui": "DaisyUI adapter for Theme Kit.",
  "@theme-kit/open-props": "Open Props adapter for Theme Kit.",
  "@theme-kit/unocss": "UnoCSS adapter for Theme Kit.",
};

const KEYWORDS = {
  "@theme-kit/core": ["theme", "theming", "dark-mode", "css-variables", "design-tokens"],
  "@theme-kit/web": ["theme", "theming", "vanilla-js", "dark-mode", "css-variables"],
  "@theme-kit/react": ["theme", "react", "theming", "dark-mode"],
  "@theme-kit/next": ["theme", "nextjs", "theming", "ssr", "dark-mode"],
  "@theme-kit/vue": ["theme", "vue", "theming", "dark-mode"],
  "@theme-kit/nuxt": ["theme", "nuxt", "theming", "ssr", "dark-mode"],
  "@theme-kit/svelte": ["theme", "svelte", "theming", "dark-mode"],
  "@theme-kit/solid": ["theme", "solidjs", "theming", "dark-mode"],
  "@theme-kit/angular": ["theme", "angular", "theming", "dark-mode"],
  "@theme-kit/astro": ["theme", "astro", "theming", "dark-mode"],
  "@theme-kit/remix": ["theme", "remix", "theming", "dark-mode"],
  "@theme-kit/tailwind": ["theme", "tailwindcss", "theming", "css-variables"],
  "@theme-kit/cli": ["theme", "cli", "generator", "theming"],
  "@theme-kit/devtools": ["theme", "devtools", "inspector", "theming"],
  "@theme-kit/mantine": ["theme", "mantine", "adapter", "theming"],
  "@theme-kit/adapters": ["theme", "adapter", "theming", "design-tokens"],
  "@theme-kit/mui": ["theme", "mui", "material-ui", "adapter", "theming"],
  "@theme-kit/chakra": ["theme", "chakra-ui", "adapter", "theming"],
  "@theme-kit/antd": ["theme", "ant-design", "antd", "adapter", "theming"],
  "@theme-kit/shadcn": ["theme", "shadcn", "adapter", "theming"],
  "@theme-kit/bootstrap": ["theme", "bootstrap", "adapter", "theming"],
  "@theme-kit/daisyui": ["theme", "daisyui", "adapter", "theming"],
  "@theme-kit/open-props": ["theme", "open-props", "adapter", "theming"],
  "@theme-kit/unocss": ["theme", "unocss", "adapter", "theming"],
};

// Packages that must become publishable (they are workspace:* dependencies of others)
const FORCE_PUBLISH = new Set(["@theme-kit/adapters"]);

// Packages that run on Node and should declare engines
const NODE_RUNTIME = new Set(["@theme-kit/core", "@theme-kit/cli", "@theme-kit/adapters"]);

const README_USAGE = {
  "@theme-kit/core": `## Quick start

\`\`\`js
import { createThemeStore, ThemeRuntime, createCSSVariablesBinding } from "@theme-kit/core";

const store = createThemeStore({
  themes: {
    light: { name: "light", tokens: { color: { background: "#ffffff" } } },
    dark: { name: "dark", tokens: { color: { background: "#0a0a0a" } } },
  },
});
const runtime = new ThemeRuntime({ store });
createCSSVariablesBinding(store);
\`\`\``,
  "@theme-kit/react": `## Quick start

\`\`\`tsx
import { ThemeProvider, useTheme } from "@theme-kit/react";

function App() {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  );
}

function Content() {
  const { theme, mode, setMode } = useTheme();
  return <button onClick={() => setMode(mode === "dark" ? "light" : "dark")}>Toggle</button>;
}
\`\`\``,
  "@theme-kit/next": `## Quick start

\`\`\`tsx
// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
\`\`\``,
  "@theme-kit/cli": `## Usage

\`\`\`bash
theme-kit --version
theme-kit generate --seed '#ea580c'
theme-kit validate theme.json
theme-kit inspect theme.json
theme-kit migrate theme.json
\`\`\``,
  "@theme-kit/tailwind": `## Usage

\`\`\`css
@import "tailwindcss";
@import "@theme-kit/tailwind";
\`\`\``,
};

function collectPackages() {
  const out = [];
  for (const base of ["packages", join("packages", "adapters")]) {
    const baseAbs = join(repoRoot, base);
    if (!existsSync(baseAbs)) continue;
    for (const entry of readdirSafe(baseAbs)) {
      const dir = join(baseAbs, entry);
      const pkgPath = join(dir, "package.json");
      if (!existsSync(pkgPath)) continue;
      out.push({ dir, pkgPath, json: JSON.parse(readFileSync(pkgPath, "utf8")) });
    }
  }
  return out;
}

function readdirSafe(p) {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

import { readdirSync } from "node:fs";

const rootLicense = readFileSync(join(repoRoot, "LICENSE"), "utf8");
const packages = collectPackages();
const repoField = { type: "git", url: `git+https://github.com/thememk/theme-kit.git` };
const bugsField = { url: `${REPO_URL}/issues` };

let changed = [];

for (const { dir, pkgPath, json } of packages) {
  const name = json.name;
  const rel = relative(repoRoot, dir);
  const publishable = !json.private || FORCE_PUBLISH.has(name);
  let dirty = false;

  if (FORCE_PUBLISH.has(name) && json.private === true) {
    delete json.private;
    dirty = true;
    console.log(`[publish] ${name}: removed private: true`);
  }

  if (!publishable) continue; // private packages (apps, examples) untouched

  if (!json.description && DESCRIPTIONS[name]) {
    json.description = DESCRIPTIONS[name];
    dirty = true;
  }
  if (!json.repository) {
    json.repository = repoField;
    dirty = true;
  } else if (typeof json.repository === "object" && json.repository.url && !json.repository.url.startsWith("git+")) {
    json.repository.url = `git+${json.repository.url}`;
    dirty = true;
  }
  if (!json.homepage) {
    json.homepage = DOCS_URL;
    dirty = true;
  } else if (json.homepage === "https://thememk.dev") {
    // old placeholder → replace with the current canonical docs URL
    json.homepage = DOCS_URL;
    dirty = true;
  }
  if (!json.bugs) {
    json.bugs = bugsField;
    dirty = true;
  }
  if (!json.keywords?.length && KEYWORDS[name]) {
    json.keywords = KEYWORDS[name];
    dirty = true;
  }
  if (NODE_RUNTIME.has(name) && !json.engines) {
    json.engines = { node: ">=18" };
    dirty = true;
  }

  // Scoped packages must publish as public; the repo's .changeset config is
  // `access: "restricted"`, which would otherwise make 1.0.0 private on npm.
  if (name.startsWith("@") && json.publishConfig?.access !== "public") {
    json.publishConfig = { ...json.publishConfig, access: "public" };
    dirty = true;
  }

  if (dirty) {
    writeFileSync(pkgPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    changed.push(rel);
  }

  // LICENSE copy
  const licensePath = join(dir, "LICENSE");
  if (!existsSync(licensePath)) {
    copyFileSync(join(repoRoot, "LICENSE"), licensePath);
    changed.push(`${rel}/LICENSE (copied)`);
  }

  // README generation
  const readmePath = join(dir, "README.md");
  if (!existsSync(readmePath)) {
    const usage = README_USAGE[name] ?? "";
    const subpaths = Object.keys(json.exports ?? {})
      .filter((s) => s !== ".")
      .join(", ");
    let subpathsSection = "";
    if (subpaths) {
      const formatted = subpaths
        .split(", ")
        .map((s) => "`" + s + "`")
        .join(", ");
      subpathsSection = "\n## Subpaths\n\n" + formatted + "\n";
    }
    const lines = [
      `# ${name}`,
      "",
      json.description ?? "",
      "",
      "## Install",
      "",
      "```bash",
      `npm install ${name}`,
      "```",
      usage,
      subpathsSection,
      "## Documentation",
      "",
      `Full API reference and guides: [Theme Kit docs](${DOCS_URL}).`,
      "",
      "## License",
      "",
      "MIT",
    ].filter((l) => l !== "");
    writeFileSync(readmePath, `${lines.join("\n")}\n`, "utf8");
    changed.push(`${rel}/README.md (generated)`);
  }
}

console.log(`\nChanged ${changed.length} files:`);
for (const c of changed) console.log(`  ${c}`);
console.log("\nDone.");
