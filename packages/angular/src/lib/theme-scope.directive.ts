import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  inject,
  ElementRef,
} from "@angular/core";
import type {
  ThemeRuntime,
  ThemeDefinition,
  ThemeTransitionOptions,
} from "@theme-kit/core";
import { THEME_KIT_RUNTIME } from "./tokens";
import { createScopedThemeBinding } from "@theme-kit/core";

@Directive({
  selector: "[themeKitScope]",
  standalone: true,
})
export class ThemeScopeDirective implements OnInit, OnDestroy {
  private runtime = inject<ThemeRuntime<ThemeDefinition>>(THEME_KIT_RUNTIME);
  private el = inject(ElementRef<HTMLElement>);

  @Input("themeKitScope") themeName = "";
  @Input("themeKitScopeTransition") transition?: ThemeTransitionOptions;

  private previousTheme: ThemeDefinition | null = null;
  private binding: ReturnType<typeof createScopedThemeBinding> | null = null;

  ngOnInit(): void {
    if (!this.themeName) return;

    this.previousTheme = this.runtime.store.get();

    const theme = (this.runtime.themes as ThemeDefinition[]).find(
      (t) => t.name === this.themeName,
    );

    if (theme) {
      this.binding = createScopedThemeBinding(
        this.runtime.themes,
        this.el.nativeElement,
        this.themeName,
        this.transition ? { transition: this.transition } : {},
      );
    }
  }

  ngOnDestroy(): void {
    this.binding?.destroy();
  }
}
