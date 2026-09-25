# @theme-kit/angular

NgModule-free theming for Angular: DI providers, reactive injectables, a scoping directive and zero-flash bootstrap helpers.

## Reference snippet

```ts
// theme/themes.ts — one definition per mode, grouped by meta.family
import { defineTheme } from "@theme-kit/core";

export const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light" },
    tokens: {
      colors: { background: "#ffffff", foreground: "#0f172a", primary: "#0d9488" },
    },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark" },
    tokens: {
      colors: { background: "#042f2e", foreground: "#ccfbf1", primary: "#5eead4" },
    },
  }),
] as const;
```

```ts
// app.config.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { provideThemeKit, injectTheme } from "@theme-kit/angular";
import { themes } from "./theme/themes";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes })],
});

// theme-switcher.ts
@Component({
  selector: "theme-switcher",
  template: `
    <button (click)="toggle()">
      {{ state().theme.name }} · {{ state().mode }}
    </button>
  `,
})
export class ThemeSwitcher {
  private state = injectTheme();
  toggle() {
    this.state().toggleTheme();
  }
}
```

## Setup

`provideThemeKit(options)` / `provideThemeKitRuntime(runtime)` app providers.

## Injectables

`injectThemeRuntime()`, `injectTheme()` (reactive `ThemeState`), `injectThemeHistory`, `injectThemeBatch`, `injectThemeSnapshot`, `injectThemeRestore`, `injectThemeTimeTravel`, `injectThemeLifecycle`, `injectThemePacks`.

## Directives

`ThemeScopeDirective` — element-scoped theming.

## SSR & Bootstrap

`createAngularPersistence()`, `createBlockingScriptContent`, `buildThemeCSSMap` — zero-flash bootstrap helpers.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
