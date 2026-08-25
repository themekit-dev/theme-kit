# @theme-kit/angular

NgModule-free theming for Angular: DI providers, reactive injectables, a scoping directive and zero-flash bootstrap helpers.

## Reference snippet

```ts
// app.config.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { provideThemeKit, injectTheme } from "@theme-kit/angular";

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
