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

/**
 * Applies a named theme to a single element, overriding the environment
 * runtime for that element's subtree.
 *
 * Use the `themeKitScope` attribute with a theme name to scope the theme to
 * the host element. The optional `themeKitScopeTransition` input configures
 * the transition used when the scoped theme is applied. The binding is
 * destroyed automatically when the directive is destroyed.
 *
 * @remarks
 * The scoped theme overrides the environment theme for the element and its
 * descendants. When the named theme is not found, no binding is created and
 * the environment theme remains in effect.
 *
 * @see {@link THEME_KIT_SCOPED_RUNTIME}
 * @see {@link ThemeScrollbarDirective}
 * @see {@link injectThemeRuntime}
 */
@Directive({
  selector: "[themeKitScope]",
  standalone: true,
})
export class ThemeScopeDirective implements OnInit, OnDestroy {
  private runtime = inject<ThemeRuntime<ThemeDefinition>>(THEME_KIT_RUNTIME);
  private el = inject(ElementRef<HTMLElement>);

  /** Theme name to scope to (`[themeKitScope]="'plum-dark'"`). Empty string
   *  disables the scope. */
  @Input("themeKitScope") themeName = "";
  /** Transition override for scoped theme changes. Inherits the runtime's
   *  transition when omitted. */
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
