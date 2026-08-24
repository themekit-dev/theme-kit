import type { UseCase } from "./use-cases";

export const libraryUseCases: Record<string, UseCase[]> = {
  shadcn: [
    {
      title: "Mount the adapter on the runtime",
      desc: "Register the adapter so every theme change repaints `--shadcn-*` variables.",
      lang: "ts",
      code: `import { createThemeRuntime } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn";

const runtime = createThemeRuntime();
runtime.adapters.use(createShadcnAdapter());
// Keep the handle to dispose later:
// const handle = runtime.adapters.use(createShadcnAdapter());
// handle.dispose();`,
    },
    {
      title: "Switch tone at runtime",
      desc: "The adapter keeps variables in sync as the active family changes.",
      lang: "ts",
      code: `// The adapter is already registered on the runtime.
// Switch the family and the adapter repaints --shadcn-* variables:

runtime.selection.setFamily("mint");
runtime.selection.setMode("dark");`,
    },
  ],
  bootstrap: [
    {
      title: "Mount the adapter on the runtime",
      desc: "The adapter generates `--bs-*` variables from the active theme.",
      lang: "ts",
      code: `import { createThemeRuntime } from "@theme-kit/core";
import { createBootstrapAdapter } from "@theme-kit/bootstrap";

const runtime = createThemeRuntime();
runtime.adapters.use(createBootstrapAdapter());`,
    },
    {
      title: "Toggle Bootstrap dark mode",
      desc: "Variables update automatically when the active mode flips.",
      lang: "ts",
      code: `// The adapter is already registered — switching the mode
// repaints every --bs-* variable on the runtime:

runtime.selection.setMode("dark");
runtime.selection.setMode("light");`,
    },
  ],
  daisyui: [
    {
      title: "Mount the adapter on the runtime",
      desc: "The adapter maps tokens to daisyUI variable names.",
      lang: "ts",
      code: `import { createThemeRuntime } from "@theme-kit/core";
import { createDaisyAdapter } from "@theme-kit/daisyui";

const runtime = createThemeRuntime();
runtime.adapters.use(createDaisyAdapter());`,
    },
    {
      title: "Switch Theme Kit theme + daisyUI stays in sync",
      desc: "Changing the active theme immediately repaints `--dbg-*` variables.",
      lang: "ts",
      code: `// The adapter is already registered — switch the family
// and every daisyUI variable updates to match:

runtime.selection.setFamily("mint");
runtime.selection.setFamily("plum");`,
    },
  ],
  "open-props": [
    {
      title: "Mount the adapter on the runtime",
      desc: "Register the Open Props adapter on an existing runtime.",
      lang: "ts",
      code: `import { createThemeRuntime } from "@theme-kit/core";
import { createOpenPropsAdapter } from "@theme-kit/open-props";

const runtime = createThemeRuntime();
runtime.adapters.use(createOpenPropsAdapter());`,
    },
    {
      title: "Reference Open Props variables in CSS",
      desc: "Use `--op-*` tokens that update as the theme changes.",
      lang: "css",
      code: `.banner {
  background: var(--op-primary);
  color: var(--op-on-primary);
  border-radius: var(--op-radius-md);
}`,
    },
  ],
  mui: [
    {
      title: "Build a static MUI theme",
      desc: "Generate a `Theme` at build time from concrete tokens.",
      lang: "ts",
      code: `import { createMuiTheme } from "@theme-kit/mui";
import { resolveTheme } from "@theme-kit/core";

const theme = createMuiTheme(resolveTheme({ family: "plum", mode: "dark" }));`,
    },
  ],
  chakra: [
    {
      title: "Build a static Chakra system",
      desc: "Turn a theme definition into a Chakra system at build time.",
      lang: "ts",
      code: `import { createChakraTheme } from "@theme-kit/chakra";

const system = createChakraTheme({ family: "mint", mode: "light" });`,
    },
  ],
  antd: [
    {
      title: "Build a static AntD config",
      desc: "Generate a `ThemeConfig` from concrete tokens at build time.",
      lang: "ts",
      code: `import { createAntdTheme } from "@theme-kit/antd";

const config = createAntdTheme({ family: "plum", mode: "dark" });`,
    },
  ],
  mantine: [
    {
      title: "Build a static Mantine theme",
      desc: "Generate a Mantine theme (with shades, fonts, radius) from tokens.",
      lang: "ts",
      code: `import { createMantineTheme } from "@theme-kit/mantine";

const theme = createMantineTheme({ family: "cocoa", mode: "dark" });`,
    },
  ],
  unocss: [
    {
      title: "Use Theme Kit utilities",
      desc: "Utilities resolve to live `--theme-*` variables, so they update at runtime.",
      lang: "tsx",
      code: `<div className="bg-primary text-primary-foreground rounded-lg shadow-md">
  This button tracks the active theme.
</div>`,
    },
    {
      title: "Generate a static theme",
      desc: "Resolve tokens to concrete `rem`/`px`/color values at build time.",
      lang: "ts",
      code: `import { createUnoTheme } from "@theme-kit/unocss";

const theme = createUnoTheme({ family: "berry", mode: "dark" });
// theme.colors.primary === "#..."`,
    },
  ],
};