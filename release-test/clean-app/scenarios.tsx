/**
 * Clean-project user test (item 25).
 *
 * A brand-new user with a clean project, pretending they've never seen Theme Kit.
 * Each scenario is written the way the docs tell you to do it and typechecked
 * against the published packages. If any scenario doesn't compile, the docs and
 * the shipped API have drifted.
 *
 * Compile with `tsc --noEmit`. This file is never executed.
 */
import { createElement } from "react";
import {
  ThemeProvider,
  useTheme,
  useThemeRuntime,
  useThemeSchedule,
  ThemeScope,
} from "@theme-kit/react";
import {
  createThemeStore,
  createThemeRuntime,
  type ThemeDefinition,
} from "@theme-kit/core";
import { useShadcnTheme } from "@theme-kit/shadcn";

// ---------------------------------------------------------------- scenario 1
// "I want dark mode."
function DarkModeToggle() {
  const { theme, setMode } = useTheme<ThemeDefinition>();
  return createElement(
    "button",
    {
      onClick: () => setMode(theme.meta?.mode === "dark" ? "light" : "dark"),
    },
    "Toggle",
  );
}
void DarkModeToggle;

// ---------------------------------------------------------------- scenario 2
// "I want five theme families." (mint, plum, sky, berry, cocoa + light/dark)
const families: ThemeDefinition[] = [
  { name: "mint-light", meta: { family: "mint", mode: "light" }, tokens: { colors: { background: "#f3faf6" } } },
  { name: "mint-dark", meta: { family: "mint", mode: "dark" }, tokens: { colors: { background: "#0a1912" } } },
  { name: "plum-light", meta: { family: "plum", mode: "light" }, tokens: { colors: { background: "#f8f6fd" } } },
  { name: "plum-dark", meta: { family: "plum", mode: "dark" }, tokens: { colors: { background: "#1b1430" } } },
  { name: "sky-light", meta: { family: "sky", mode: "light" }, tokens: { colors: { background: "#f3f8fe" } } },
  { name: "sky-dark", meta: { family: "sky", mode: "dark" }, tokens: { colors: { background: "#0c1d2f" } } },
  { name: "berry-light", meta: { family: "berry", mode: "light" }, tokens: { colors: { background: "#fdf4f7" } } },
  { name: "berry-dark", meta: { family: "berry", mode: "dark" }, tokens: { colors: { background: "#1f1218" } } },
  { name: "cocoa-light", meta: { family: "cocoa", mode: "light" }, tokens: { colors: { background: "#f8f3ee" } } },
  { name: "cocoa-dark", meta: { family: "cocoa", mode: "dark" }, tokens: { colors: { background: "#17110c" } } },
];

function FamilySwitcher() {
  const { family, setFamily } = useTheme<ThemeDefinition>();
  const cycle = ["mint", "plum", "sky", "berry", "cocoa"] as const;
  const idx = Math.max(0, cycle.indexOf((family as (typeof cycle)[number])));
  const next = cycle[(idx + 1) % cycle.length];
  return createElement("button", { onClick: () => setFamily(next) }, "next family");
}
void FamilySwitcher;

// ---------------------------------------------------------------- scenario 3
// "I use Next.js." — app/layout.tsx (typecheck only; next is a peer of the app)
import { ThemeProvider as NextThemeProvider } from "@theme-kit/next";
function NextRootLayout({ children }: { children: React.ReactNode }) {
  return createElement(
    NextThemeProvider,
    {
      lang: "en",
      themes: families,
      defaultTheme: "mint-light",
      children: createElement("html", null, createElement("body", null, children)),
    },
  );
}
void NextRootLayout;

// ---------------------------------------------------------------- scenario 4
// "I use shadcn." — install the adapter into a component
function ShadcnConsumer() {
  useShadcnTheme(); // installs the shadcn CSS-variable adapter on the runtime
  const { store, selection } = useThemeRuntime<ThemeDefinition>();
  return createElement("div", null, String(store.get().name), selection.getFamily());
}
void ShadcnConsumer;

// ---------------------------------------------------------------- scenario 5
// "I want sunrise/sunset." — scheduled runtime + reactive controller
const sunriseRuntime = createThemeRuntime<ThemeDefinition>({
  themes: families,
  defaultTheme: "mint-light",
  initialMode: "system",
  scheduled: {
    latitude: 51.5, // London
    longitude: -0.12,
    lightTheme: "mint-light",
    darkTheme: "mint-dark",
  },
  persistence: null,
  broadcast: null,
});
void sunriseRuntime;

function ScheduleCard() {
  const schedule = useThemeSchedule(); // ThemeSchedule | null
  const enabled: boolean = schedule?.enabled ?? false;
  void enabled;
  return createElement(
    "button",
    {
      onClick: () => {
        if (schedule?.enabled) schedule.disable();
        else schedule?.enable();
      },
    },
    "schedule",
  );
}
void ScheduleCard;

// ---------------------------------------------------------------- scenario 6
// "I want a custom scope." — isolate a widget
function ScopedWidget() {
  return createElement(
    ThemeScope,
    { theme: "berry-dark", children: createElement("div", null, "an isolated widget") },
  );
}
void ScopedWidget;

// ---------------------------------------------------------------- vanilla core
// The store + runtime alone (no framework) — as documented in the core guide.
const store = createThemeStore<ThemeDefinition>({
  initialTheme: families[0]!,
});
const vanillaRuntime = createThemeRuntime({
  themes: families,
  defaultTheme: "mint-light",
  initialMode: "light",
  dom: false,
  cssVariables: false,
  persistence: null,
  broadcast: null,
});
void store;
void vanillaRuntime;

export {};
