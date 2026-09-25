import type { CompositionId } from "../components/showcase/compositions";

/**
 * Showcase catalog.
 *
 * A **showcase** is a purpose-built visual composition — a mock interface that
 * exists to demonstrate what a Theme Kit theme looks like applied to a real
 * product surface. An **example** (see `/examples`) is a runnable, instructional
 * implementation of one feature. The two are deliberately different jobs:
 *
 *   /showcase → "this is what Theme Kit makes possible"
 *   /examples → "copy this and learn how Theme Kit works"
 *
 * `implementationHref` is the bridge: a showcase points at the guide or reference
 * that shows how to build it for real.
 */

/**
 * Categories are the gallery's navigation model. A gallery scales by filtering —
 * a table of contents grows into a wall of links, whereas a filter bar stays
 * useful as pieces are added.
 */
export type ShowcaseCategory =
  | "dashboards"
  | "saas"
  | "commerce"
  | "developer"
  | "marketing"
  | "components";

/**
 * The canonical category order. Tabs are rendered from the categories that
 * actually have pieces, so adding a composition is all it takes to reveal its
 * tab — and an empty category never renders a dead end.
 */
export const SHOWCASE_CATEGORIES: { id: ShowcaseCategory; label: string }[] = [
  { id: "dashboards", label: "Dashboards" },
  { id: "saas", label: "SaaS" },
  { id: "commerce", label: "Commerce" },
  { id: "developer", label: "Developer" },
  { id: "marketing", label: "Marketing" },
  { id: "components", label: "Components" },
];

export type ShowcaseEntry = {
  id: CompositionId;
  title: string;
  /** One line, shown under the title. */
  tagline: string;
  category: ShowcaseCategory;
  /** Layout character, so the gallery proves Theme Kit is not one style. */
  character: string;
  tags: string[];
  /** What this composition demonstrates about Theme Kit. */
  demonstrates: string[];
  /** The flagship gets a full-width, taller preview. */
  hero?: boolean;
  /** Where to read how to build it. */
  implementationHref: string;
  implementationLabel: string;
};

export const SHOWCASE: ShowcaseEntry[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    tagline:
      "A production-style analytics dashboard with navigation, metric cards, charts and an activity feed.",
    category: "dashboards",
    character: "Dense and structured",
    tags: ["Sidebar", "Metric cards", "Charts", "Activity feed", "Mode toggle"],
    demonstrates: [
      "A single theme drives navigation, surfaces, borders and charts together",
      "Chart fills use the primary token, so they re-tint with the family",
      "Light / system / dark switching inside the app chrome",
    ],
    hero: true,
    implementationHref: "/framework-guides/next",
    implementationLabel: "Build it in Next.js",
  },
  {
    id: "analytics",
    title: "Analytics",
    tagline: "Metrics, a trend chart and a data table with range controls.",
    category: "dashboards",
    character: "Data-dense, tabular",
    tags: ["Metric row", "Sparkline", "Data table", "Range picker"],
    demonstrates: [
      "Tabular numerals stay legible across every family",
      "The sparkline stroke reads --theme-color-primary directly",
      "Muted surfaces separate chrome from content without extra colors",
    ],
    implementationHref: "/tokens",
    implementationLabel: "Semantic tokens",
  },
  {
    id: "saas-settings",
    title: "SaaS settings",
    tagline:
      "Workspace settings with tabs, preference rows, toggles and a billing card.",
    category: "saas",
    character: "Form-driven, calm",
    tags: ["Tabs", "Toggles", "Preference rows", "Billing"],
    demonstrates: [
      "Selected tab, focus ring and active toggle all use the primary token",
      "The appearance row mirrors the real mode switch",
      "Dividers and card borders come from a single border token",
    ],
    implementationHref: "/persistence",
    implementationLabel: "Persist the selection",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    tagline:
      "A storefront with a promo banner, a product grid and cart affordances.",
    category: "commerce",
    character: "Image-led and airy",
    tags: ["Product grid", "Promo banner", "Price", "Badges"],
    demonstrates: [
      "Product imagery tints derive from the primary token",
      "Sale and new badges stay distinguishable in both modes",
      "A spacious layout still reads correctly on a dark theme",
    ],
    implementationHref: "/libraries",
    implementationLabel: "Library adapters",
  },
  {
    id: "documentation",
    title: "Documentation UI",
    tagline:
      "A docs layout with navigation, prose, a callout, a code block and an on-this-page rail.",
    category: "developer",
    character: "Typography and code heavy",
    tags: ["Sidebar", "Prose", "Callout", "Code block", "TOC"],
    demonstrates: [
      "Code blocks are themed by the same tokens as the surrounding page",
      "Callout tint comes from the primary token, not a hardcoded blue",
      "Three-column density survives a family change",
    ],
    implementationHref: "/core-concepts",
    implementationLabel: "Core concepts",
  },
  {
    id: "marketing",
    title: "Marketing site",
    tagline:
      "A product landing page with a centered hero, social proof, feature cards and a pricing band.",
    category: "marketing",
    character: "Spacious and editorial",
    tags: ["Hero", "Nav", "Logo band", "Feature cards", "Testimonial"],
    demonstrates: [
      "The same tokens that drive a data-dense dashboard drive an airy marketing page",
      "Large display type and generous whitespace survive a family change",
      "Gradient washes derive from the primary token, not a hardcoded brand color",
    ],
    implementationHref: "/presets/brand",
    implementationLabel: "Brand presets",
  },
  {
    id: "component-gallery",
    title: "Component gallery",
    tagline:
      "Buttons, badges, inputs, alerts, tabs and avatars — the whole control surface at once.",
    category: "components",
    character: "Systematic and comparative",
    tags: ["Buttons", "Badges", "Inputs", "Alerts", "Tabs", "Avatars"],
    demonstrates: [
      "Every control variant resolves from the same semantic token set",
      "Default, focus and invalid input states are visible side by side",
      "The fastest way to see whether a family has enough contrast range",
    ],
    implementationHref: "/adapters",
    implementationLabel: "Adapter architecture",
  },
];

export const SHOWCASE_HERO = SHOWCASE.find((s) => s.hero) ?? SHOWCASE[0]!;

/** Categories that have at least one piece, in canonical order. */
export const PRESENT_CATEGORIES = SHOWCASE_CATEGORIES.filter((c) =>
  SHOWCASE.some((s) => s.category === c.id),
);
