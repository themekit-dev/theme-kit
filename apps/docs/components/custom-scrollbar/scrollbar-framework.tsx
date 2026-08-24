"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CodeBlock } from "../code-block";
import { highlightCode } from "../../lib/highlight";
import { useScrollToOnChange } from "../ui/use-scroll-to-on-change";

export type ScrollbarFramework =
  | "react"
  | "next"
  | "vue"
  | "svelte"
  | "solid"
  | "angular"
  | "web"
  | "nuxt"
  | "remix"
  | "vanilla";

type ScrollbarExample = {
  lang: string;
  code: string;
  filename?: string;
};

export const SCROLLBAR_FRAMEWORKS: {
  id: ScrollbarFramework;
  label: string;
}[] = [
  { id: "react", label: "React" },
  { id: "next", label: "Next.js" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
  { id: "solid", label: "Solid" },
  { id: "angular", label: "Angular" },
  { id: "web", label: "Web Components" },
  { id: "nuxt", label: "Nuxt" },
  { id: "remix", label: "Remix" },
  { id: "vanilla", label: "Vanilla JS" },
];

interface ScrollbarCtx {
  framework: ScrollbarFramework;
  setFramework: (f: ScrollbarFramework) => void;
}

const ScrollbarFrameworkContext = createContext<ScrollbarCtx | null>(null);

export function ScrollbarFrameworkProvider({
  children,
  defaultFramework = "react",
}: {
  children: ReactNode;
  defaultFramework?: ScrollbarFramework;
}) {
  const [framework, setFramework] = useState<ScrollbarFramework>(defaultFramework);
  return (
    <ScrollbarFrameworkContext.Provider value={{ framework, setFramework }}>
      {children}
    </ScrollbarFrameworkContext.Provider>
  );
}

export function useScrollbarFramework(): ScrollbarCtx {
  const c = useContext(ScrollbarFrameworkContext);
  if (!c) throw new Error("useScrollbarFramework must be used within ScrollbarFrameworkProvider");
  return c;
}

export function ScrollbarFrameworkSelector({
  scrollToId,
}: {
  scrollToId?: string;
}) {
  const { framework, setFramework } = useScrollbarFramework();

  // Scroll after the framework change commits, so the target's position is
  // measured after any snippet-height changes above it have settled.
  useScrollToOnChange(scrollToId, framework);

  return (
    <div className="flex flex-wrap gap-1.5 mb-4" role="tablist">
      {SCROLLBAR_FRAMEWORKS.map((f) => {
        const active = framework === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFramework(f.id)}
            className={`chip ${active ? "chip-active" : ""}`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

export function ScrollbarFrameworkCode({
  map,
  fallback,
}: {
  map: Partial<Record<ScrollbarFramework, ScrollbarExample>>;
  fallback?: ReactNode;
}) {
  const { framework } = useScrollbarFramework();
  const example = map[framework];
  if (!example) return fallback ?? null;
  return (
    <CodeBlock
      html={highlightCode(example.code, example.lang)}
      code={example.code}
      language={example.lang}
      {...(example.filename ? { filename: example.filename } : {})}
      className="rounded-lg m-0"
    />
  );
}

export const MOUNT_SNIPPETS: Record<ScrollbarFramework, ScrollbarExample> = {
  react: {
    lang: "tsx",
    code: `import { ThemeProvider, ThemeScrollbar } from "@theme-kit/react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function Layout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="light">
      <ThemeScrollbar
        behavior={{ autoHide: true }}
        appearance={{ thickness: 8, radius: 999 }}
        icons={{ up: <ArrowUp />, down: <ArrowDown /> }}
      />
      {children}
    </ThemeProvider>
  );
}`,
  },
  next: {
    lang: "tsx",
    code: `import { ThemeProvider, ThemeScrollbar } from "@theme-kit/next";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="light"
      scrollbar // server-rendered pre-paint CSS — no flash, no hydration mismatch
    >
      <ThemeScrollbar
        behavior={{ autoHide: true }}
        icons={{ up: <ArrowUp />, down: <ArrowDown /> }}
      />
      {children}
    </ThemeProvider>
  );
}`,
  },
  vue: {
    lang: "vue",
    code: `<script setup>
import { ThemeProvider, ThemeScrollbar } from "@theme-kit/vue";
</script>

<template>
  <ThemeProvider :themes="themes" defaultTheme="light">
    <ThemeScrollbar />
    <slot />
  </ThemeProvider>
</template>`,
  },
  svelte: {
    lang: "svelte",
    code: `<script>
  import { ThemeProvider, ThemeScrollbar } from "@theme-kit/svelte";
</script>

<ThemeProvider {themes} defaultTheme="light">
  <ThemeScrollbar />
  <slot />
</ThemeProvider>`,
  },
  solid: {
    lang: "tsx",
    code: `import { ThemeProvider, ThemeScrollbar } from "@theme-kit/solid";

export default function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="light">
      <ThemeScrollbar />
      <div>{/* your app */}</div>
    </ThemeProvider>
  );
}`,
  },
  angular: {
    lang: "tsx",
    code: `import { Component } from "@angular/core";
import {
  provideThemeKit,
  ThemeScrollbarDirective,
} from "@theme-kit/angular";

@Component({
  selector: "app-root",
  template: \`
    <div
      themeKitScrollbar
      [themeKitScrollbarOptions]="{ autoHide: true, arrows: true }"
    ></div>
    <router-outlet />
  \`,
  standalone: true,
  imports: [ThemeScrollbarDirective],
  providers: [provideThemeKit()],
})
export class AppComponent {}`,
  },
  web: {
    lang: "html",
    code: `<theme-kit-scrollbar auto-hide thickness="8" radius="999"></theme-kit-scrollbar>

<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements(); // registers <theme-kit-provider>, <theme-kit-scrollbar>, ...
</script>`,
  },
  nuxt: {
    lang: "vue",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "light",
    scrollbar: true, // server-rendered pre-paint scrollbar CSS
  },
});

// app.vue — ThemeScrollbar is auto-imported by the module
<template>
  <ThemeScrollbar auto-hide />
  <NuxtPage />
</template>`,
  },
  remix: {
    lang: "tsx",
    code: `import { ThemeProvider, ThemeScrollbar } from "@theme-kit/remix";

export default function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="light">
      <ThemeScrollbar behavior={{ autoHide: true }} />
      <Outlet />
    </ThemeProvider>
  );
}`,
  },
  vanilla: {
    lang: "ts",
    code: `import {
  createThemeRuntime,
  createThemeScrollbar,
} from "@theme-kit/core";
import "@theme-kit/core/scrollbar.css";
import themes from "./themes";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
});

// One call mounts the overlay and discovers every scrollable
// container on the page. Returns an OverlayScrollbarHandle (or
// null on SSR / coarse-pointer devices).
const handle = createThemeScrollbar(runtime.store, {
  autoHide: true,
  arrows: true,
  thickness: 8,
  radius: 999,
});

// The strips recolor automatically when the theme changes.
runtime.selection.setMode("dark");`,
  },
};

export const OPTIONS_SNIPPETS: Record<ScrollbarFramework, ScrollbarExample> = {
  react: {
    lang: "tsx",
    code: `<ThemeScrollbar
  behavior={{
    autoHide: true,
    autoHideDelay: 900,
    hoverExpand: false,
    draggable: true,
    clickToJump: true,
    smooth: false,
    overscroll: true,
    axes: ["x", "y"],
    touch: false,
    dir: "ltr",
  }}
  appearance={{
    arrows: true,
    thickness: 8,
    hoverThickness: 12,
    radius: 999,
    minThumbSize: 40,
    offset: 2,
    trackOpacity: 0.2,
    thumbOpacity: 0.7,
    zIndex: 9999,
    duration: 180,
    animationDuration: 180,
    include: [".panel"],
    exclude: [".no-scroll"],
    thumbColor: "#ff6b6b",
    trackColor: "#2d2d2d",
    activeThumbColor: "#ff4444",
    thumbHoverColor: "#ff8888",
  }}
  icons={{
    arrow: <ScrollIcon />,
    up: <ArrowUp />,
    down: <ArrowDown />,
    left: <ArrowLeft />,
    right: <ArrowRight />,
  }}
/>`,
  },
  next: {
    lang: "tsx",
    code: `<ThemeScrollbar
  behavior={{ autoHide: true, clickToJump: true }}
  appearance={{ thickness: 8, radius: 999, hoverThickness: 12 }}
  icons={{ up: <ArrowUp />, down: <ArrowDown /> }}
/>`,
  },
  vue: {
    lang: "vue",
    code: `<template>
  <ThemeScrollbar
    :behavior="{ autoHide: true, clickToJump: true }"
    :appearance="{ thickness: 8, radius: 999, hoverThickness: 12 }"
    :icons="{ up: ArrowUp, down: ArrowDown }"
  />
</template>`,
  },
  svelte: {
    lang: "svelte",
    code: `<ThemeScrollbar
  behavior={{ autoHide: true, clickToJump: true }}
  appearance={{ thickness: 8, radius: 999, hoverThickness: 12 }}
  icons={{ up: ArrowUp, down: ArrowDown }}
/>`,
  },
  solid: {
    lang: "tsx",
    code: `<ThemeScrollbar
  behavior={{ autoHide: true, clickToJump: true }}
  appearance={{ thickness: 8, radius: 999, hoverThickness: 12 }}
  icons={{ up: <ArrowUp />, down: <ArrowDown /> }}
/>`,
  },
  angular: {
    lang: "tsx",
    code: `<div
  themeKitScrollbar
  [themeKitScrollbarOptions]="{
    autoHide: true,
    arrows: true,
    thickness: 8,
    radius: 999,
    hoverThickness: 12,
    arrowUpIcon: chevronUp,
    arrowDownIcon: chevronDown
  }"
></div>`,
  },
  web: {
    lang: "html",
    code: `<theme-kit-scrollbar
  auto-hide
  arrows
  thickness="8"
  radius="999"
  hover-thickness="12"
  arrow-up-icon="data:image/svg+xml,..."
></theme-kit-scrollbar>`,
  },
  nuxt: {
    lang: "vue",
    code: `// app.vue — same grouped props as Vue
<template>
  <ThemeScrollbar
    :behavior="{ autoHide: true }"
    :appearance="{ thickness: 8, radius: 999 }"
    :icons="{ up: ArrowUp, down: ArrowDown }"
  />
</template>`,
  },
  remix: {
    lang: "tsx",
    code: `<ThemeScrollbar
  behavior={{ autoHide: true, clickToJump: true }}
  appearance={{ thickness: 8, radius: 999 }}
  icons={{ up: <ArrowUp />, down: <ArrowDown /> }}
/>`,
  },
  vanilla: {
    lang: "ts",
    code: `createThemeScrollbar(store, {
  autoHide: true,
  autoHideDelay: 900,
  hoverExpand: false,
  draggable: true,
  clickToJump: true,
  smooth: false,
  overscroll: true,
  axes: ["vertical", "horizontal"],
  touch: false,
  dir: "ltr",
  arrows: true,
  thickness: 8,
  hoverThickness: 12,
  radius: 999,
  minThumbSize: 40,
  offset: 2,
  trackOpacity: 0.2,
  thumbOpacity: 0.7,
  duration: 180,
  animationDuration: 180,
  include: [".panel"],
  exclude: [".no-scroll"],
});`,
  },
};

export const FLASHFREE_SNIPPETS: Partial<
  Record<ScrollbarFramework, ScrollbarExample>
> = {
  next: {
    lang: "tsx",
    code: `// Server-rendered: pass \`scrollbar\` to the Next.js ThemeProvider.
// It inlines createPrePaintScrollbarCSS() into the SSR <head> + the
// tk-scrollbar class — no blocking script, no hydration mismatch.
import { ThemeProvider, ThemeScrollbar } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="light" scrollbar>
      <ThemeScrollbar behavior={{ autoHide: true }} />
      {children}
    </ThemeProvider>
  );
}`,
  },
  nuxt: {
    lang: "ts",
    code: `// Server-rendered: set \`scrollbar: true\` in the module config.
// Nuxt inlines createPrePaintScrollbarCSS() into the SSR <head> +
// the tk-scrollbar class — no blocking script, no hydration mismatch.
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "light",
    scrollbar: true,
  },
});`,
  },
  vanilla: {
    lang: "ts",
    code: `// Server rendered: inline createPrePaintScrollbarCSS() + the
// tk-scrollbar class instead of a blocking <script>.
import { createPrePaintScrollbarCSS } from "@theme-kit/core";

const head = [
  "<!doctype html>",
  '<html class="tk-scrollbar">',
  '  <head>',
  \`    <style>\${createPrePaintScrollbarCSS()}</style>\`,
  '  </head>',
  "</html>",
].join("\\n");`,
  },
};

export const ARROW_SNIPPETS: Partial<
  Record<ScrollbarFramework, ScrollbarExample>
> = {
  react: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/react";
import { ChevronUp, ChevronDown } from "lucide-react";

// Pass any ReactNode as arrow icons via the icons group
<ThemeScrollbar
  icons={{
    up: <ChevronUp />,
    down: <ChevronDown />,
  }}
/>`,
  },
  next: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/next";

<ThemeScrollbar
  icons={{
    up: <ChevronUp />,
    down: <ChevronDown />,
  }}
/>`,
  },
  vue: {
    lang: "vue",
    code: `<script setup>
import { ThemeScrollbar } from "@theme-kit/vue";
</script>

<template>
  <ThemeScrollbar
    :icons="{
      up: ChevronUp,
      down: ChevronDown,
    }"
  />
</template>`,
  },
  svelte: {
    lang: "svelte",
    code: `<script>
  import { ThemeScrollbar } from "@theme-kit/svelte";
</script>

<ThemeScrollbar
  icons={{
    up: ChevronUp,
    down: ChevronDown,
  }}
/>`,
  },
  solid: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/solid";

<ThemeScrollbar
  icons={{
    up: <ChevronUp />,
    down: <ChevronDown />,
  }}
/>`,
  },
  angular: {
    lang: "ts",
    code: `import { Component } from "@angular/core";
import { ThemeScrollbarDirective } from "@theme-kit/angular";

@Component({
  selector: "app-root",
  template: \`
    <div
      themeKitScrollbar
      [themeKitScrollbarOptions]="{
        arrowUpIcon: chevronUp,
        arrowDownIcon: chevronDown
      }"
    ></div>
  \`,
  standalone: true,
  imports: [ThemeScrollbarDirective],
})
export class AppComponent {}`,
  },
  web: {
    lang: "html",
    code: `<theme-kit-scrollbar
  arrow-up-icon="data:image/svg+xml,..."
  arrow-down-icon="data:image/svg+xml,..."
></theme-kit-scrollbar>`,
  },
  nuxt: {
    lang: "vue",
    code: `<!-- app.vue — ThemeScrollbar is auto-imported -->
<template>
  <ThemeScrollbar
    :icons="{
      up: ChevronUp,
      down: ChevronDown,
    }"
  />
</template>`,
  },
  remix: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/remix";

<ThemeScrollbar
  icons={{
    up: <ChevronUp />,
    down: <ChevronDown />,
  }}
/>`,
  },
  vanilla: {
    lang: "ts",
    code: `// Vanilla JS uses the core options object — pass raw DOM nodes
// (elements / inline SVG) as arrow icons.
createThemeScrollbar(store, {
  arrowUpIcon: document.querySelector("#chevron-up"),
  arrowDownIcon: document.querySelector("#chevron-down"),
});`,
  },
};

export const CONTAINER_SNIPPETS: Partial<
  Record<ScrollbarFramework, ScrollbarExample>
> = {
  react: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/react";

// Scrollbar scoped to a specific container
<ThemeScrollbar
  appearance={{ include: [".panel"] }}
/>

<div className="panel" style={{ overflow: "auto", height: 400 }}>
  <LongContent />
</div>`,
  },
  next: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/next";

<ThemeScrollbar
  appearance={{ include: [".panel"] }}
/>

<div className="panel" style={{ overflow: "auto", height: 400 }}>
  <LongContent />
</div>`,
  },
  vue: {
    lang: "vue",
    code: `<template>
  <ThemeScrollbar
    :appearance="{ include: ['.panel'] }"
  />

  <div class="panel" style="overflow: auto; height: 400px">
    <LongContent />
  </div>
</template>`,
  },
  svelte: {
    lang: "svelte",
    code: `<ThemeScrollbar
  appearance={{ include: [".panel"] }}
/>

<div class="panel" style="overflow: auto; height: 400px">
  <LongContent />
</div>`,
  },
  solid: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/solid";

<ThemeScrollbar
  appearance={{ include: [".panel"] }}
/>

<div class="panel" style={{ overflow: "auto", height: "400px" }}>
  <LongContent />
</div>`,
  },
  angular: {
    lang: "ts",
    code: `import { Component } from "@angular/core";
import { ThemeScrollbarDirective } from "@theme-kit/angular";

@Component({
  selector: "app-root",
  template: \`
    <div
      themeKitScrollbar
      [themeKitScrollbarOptions]="{ include: ['.panel'] }"
    ></div>

    <div class="panel" style="overflow: auto; height: 400px">
      <long-content />
    </div>
  \`,
  standalone: true,
  imports: [ThemeScrollbarDirective],
})
export class AppComponent {}`,
  },
  web: {
    lang: "html",
    code: `<theme-kit-scrollbar include=".panel"></theme-kit-scrollbar>

<div class="panel" style="overflow: auto; height: 400px">
  <long-content></long-content>
</div>`,
  },
  nuxt: {
    lang: "vue",
    code: `<template>
  <ThemeScrollbar
    :appearance="{ include: ['.panel'] }"
  />

  <div class="panel" style="overflow: auto; height: 400px">
    <LongContent />
  </div>
</template>`,
  },
  remix: {
    lang: "tsx",
    code: `import { ThemeScrollbar } from "@theme-kit/remix";

<ThemeScrollbar
  appearance={{ include: [".panel"] }}
/>

<div className="panel" style={{ overflow: "auto", height: 400 }}>
  <LongContent />
</div>`,
  },
  vanilla: {
    lang: "ts",
    code: `import { createThemeScrollbar } from "@theme-kit/core";

// Scope the overlay to specific containers via the options object
createThemeScrollbar(store, {
  include: [".panel"],
});`,
  },
};
