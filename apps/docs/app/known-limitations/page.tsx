import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { Callout } from "../../components/ui/callout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Known Limitations",
  description:
    "Honest boundaries of Theme Kit: browser API availability, SSR trade-offs, touch behavior, adapter constraints, and where behavior is intentionally different across environments.",
};

const pageHeadings = buildPageHeadings([
  { text: "View Transitions API", level: 2 },
  { text: "Custom scrollbar", level: 2 },
  { text: "Touch and mobile", level: 2 },
  { text: "SSR", level: 2 },
  { text: "System dark with JavaScript disabled", level: 2 },
  { text: "Adapter constraints", level: 2 },
  { text: "Framework-specific gaps", level: 2 },
  { text: "Framework dependency advisories", level: 2 },
  { text: "Svelte ThemeScope reactivity", level: 2 },
]);

function Limitation({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 mb-10">
      <SectionHeading num={num}>{title}</SectionHeading>
      {children}
    </section>
  );
}

export default function KnownLimitationsPage() {
  return (
    <DocsLayout headings={pageHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Reference"
          icon="info"
          title="Known limitations"
          description={
            <>
              A serious library doesn&apos;t pretend everything is universal. These are the
              boundaries we know about — documented so they&apos;re not a surprise.
            </>
          }
        />

      <Limitation id="view-transitions" num={1} title="View Transitions API availability">
        <p>
          Runtime transitions use the <strong>View Transitions API</strong> when available and
          fall back to a CSS-variable cross-fade otherwise. The View Transitions API is not
          available in every browser or context:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Not available in Firefox as of writing — the CSS cross-fade fallback is used.</li>
          <li>Only applies to top-level same-origin navigations/updates; scoped updates inside
            <code> ThemeScope</code> use the fallback path.</li>
          <li>
            If <code>prefers-reduced-motion: reduce</code> is set, transitions are disabled entirely
            rather than degraded.
          </li>
        </ul>
      </Limitation>

      <Limitation id="scrollbar" num={2} title="Custom scrollbar">
        <p>
          <code>ThemeScrollbar</code> is an <em>overlay</em> scrollbar: it hides the native
          scrollbar and draws its own. This has consequences:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The native scrollbar is hidden via the pre-paint CSS; content width does not change
            (no layout shift), but the scrollbar itself occupies no space — content can be obscured
            until the overlay thumb is over it.</li>
          <li>Browser-specific native scrollbar styling (Firefox <code>scrollbar-width</code>, WebKit
            pseudo-elements) is replaced, not enhanced.</li>
          <li>Scroll-linked effects that measure <code>window.innerWidth</code> before the overlay
            mounts can observe the wider viewport.</li>
        </ul>
      </Limitation>

      <Limitation id="touch" num={3} title="Touch and mobile">
        <p>
          On touch devices the overlay scrollbar is intentionally inert: it does not fight native
          touch scrolling. The scrollbar engine observes pointer/touch input and does not attach
          drag handling to touch pointers. Consequences:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Touch scrolling is fully native — the overlay thumb is informational, not draggable,
            on touch.</li>
          <li>On hybrid devices (touch laptops), a coarse-pointer touch event disables drag
            interaction until a fine pointer is detected again.</li>
          <li>iOS Safari's rubber-banding and scroll-to-refresh behave exactly as the native
            scrollbar would — the overlay does not interfere.</li>
        </ul>
      </Limitation>

      <Limitation id="ssr" num={4} title="SSR">
        <p>
          SSR support differs slightly by framework. Next.js and Nuxt are the reference
          integrations with the full story (cookie resolution, fingerprint, blocking bootstrap,
          zero flash). The others hydrate client-side:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Vue / Svelte / Solid / Angular</strong> providers are client components; SSR
            renders the provider but theme resolution happens on hydration. Use the core
            <code> createThemeBootstrapScript</code> for zero-flash in those frameworks.</li>
          <li>Angular ships an <code>esm</code> + <code>default</code> export map (ng-packagr
            layout) rather than the standard <code>import</code>/<code>require</code> conditions;
            Node <code>require()</code> of the Angular package is not supported.</li>
          <li>The <code>ThemeScrollbar</code> SSR output is pre-paint CSS only; the overlay engine
            mounts on hydration.</li>
        </ul>
      </Limitation>

      <Limitation id="system-dark-no-js" num={5} title="System dark with JavaScript disabled">
        <p>
          With JavaScript disabled and <code>initialMode: "system"</code>, the first paint uses the
          light theme. The <code>@media (prefers-color-scheme: dark)</code> fallback block cannot
          override the inline light CSS variables that the SSR render applies to{" "}
          <code>&lt;html&gt;</code>. The blocking bootstrap script is the primary zero-flash
          mechanism; with JS enabled, system dark is applied before first paint in every browser
          that supports <code>matchMedia</code>.
        </p>
      </Limitation>

      <Limitation id="adapters" num={6} title="Adapter constraints">
        <p>
          Adapters bridge tokens into a component library — they don't replicate every library
          behavior:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>MUI / Chakra / Ant Design / Mantine</strong> adapters are React-based and are
            available in React, Next.js, Astro, and Remix. They are not shipped for Vue, Svelte, or
            Solid — using a React-only component library in a non-React framework is not a supported
            combination.</li>
          <li><strong>shadcn/ui, Bootstrap, DaisyUI, Open Props</strong> have framework-neutral
            factories and CSS output, so they work in every framework.</li>
          <li><strong>UnoCSS</strong> is a preset: it maps tokens to utilities that reference the
            live <code>--theme-*</code> variables, so it has no runtime install/update/cleanup
            lifecycle of its own.</li>
          <li><strong>Mantine</strong> is a theme builder + hook; apply it manually when the theme
            changes (it has no runtime adapter).</li>
        </ul>
      </Limitation>

      <Limitation id="framework-gaps" num={7} title="Framework-specific gaps">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Svelte</strong> — <code>ThemeScope</code> reads <code>theme</code> /{" "}
            <code>family</code> / <code>mode</code> props at mount only (the component is a
            legacy-style Svelte component). React, Vue, and Solid react to prop changes. Remount the
            scope to change an explicit theme in Svelte.</li>
          <li><strong>Angular</strong> — the docs app and adapters are verified against the
            standalone <code>provideThemeKit</code> integration; Angular Universal streaming is not
            verified.</li>
          <li><strong>Nuxt</strong> — the module targets Nuxt 3.10+; auto-imported composables work
            in the app directory, and server utilities are exported from the package root.</li>
        </ul>
      </Limitation>

      <Limitation id="dependencies" num={8} title="Framework dependency advisories">
        <p>
          <code>@theme-kit/*</code> packages ship <strong>zero external runtime dependencies</strong>{" "}
          — frameworks are peer dependencies. When you install a framework, its own dependency tree
          is yours. Run <code>npm audit</code> / <code>pnpm audit</code> in your application and
          upgrade framework versions to clear advisories in their transitive dependencies (for
          example, Next.js→postcss, Astro→sharp, Nuxt→brace-expansion, Remix→turbo-stream,
          Angular→fast-uri).
        </p>
      </Limitation>

      <Limitation id="svelte-scope" num={9} title="Svelte ThemeScope reactivity">
        <p>
          This limitation is called out above and repeated for visibility: <code>ThemeScope</code>{" "}
          in Svelte reads its props at mount. It still follows provider mode changes for
          family/boundary scopes via the store subscription, but an explicit <code>theme</code>{" "}
          prop change requires a remount. See{" "}
          <a href="/api-reference/svelte" className="underline">the Svelte API reference</a>.
        </p>
      </Limitation>

      <Callout variant="neutral" title="Anything else?">
        <p>
          These are the boundaries we know about. If you hit something that behaves differently
          across environments and isn't listed here, file an issue — it's either a bug or a
          limitation we should document.
        </p>
      </Callout>
      </div>
    </DocsLayout>
  );
}
