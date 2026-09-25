import {
  Directive,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  createOverlayScrollbar,
  type OverlayScrollbarHandle,
  type OverlayScrollbarOptions,
  type ThemeRuntime,
  type ThemeDefinition,
} from "@theme-kit/core";
import { THEME_KIT_RUNTIME } from "./tokens";

/**
 * Phase 2 — ThemeScrollbarDirective: overlay only.
 *
 * Creates the custom scrollbar overlay. Does NOT hide the native
 * scrollbar — that's the bootstrap script's job (Phase 1, tk-scrollbar).
 *
 * ```html
 * <div themeKitScrollbar [themeKitScrollbarOptions]="{ thickness: 8 }"></div>
 * ```
 *
 * @see {@link ThemeScopeDirective}
 * @see {@link ThemeInspectorComponent}
 * @see {@link injectThemeRuntime}
 */
@Directive({
  selector: "[themeKitScrollbar]",
  standalone: true,
})
export class ThemeScrollbarDirective implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private runtime = inject<ThemeRuntime<ThemeDefinition>>(THEME_KIT_RUNTIME);

  /** Overlay scrollbar options passed to the engine
   *  (`[themeKitScrollbarOptions]="{ thickness: 8 }"`). */
  readonly options = input<OverlayScrollbarOptions>(
    {},
    { alias: "themeKitScrollbarOptions" },
  );

  private handle: OverlayScrollbarHandle | null = null;

  constructor() {
    // Rebuilds whenever the options input changes — the engine resolves its
    // options once, when the overlay is created, so a new value only takes
    // effect if the overlay is rebuilt.
    effect(() => {
      const options = this.options();
      if (!isPlatformBrowser(this.platformId)) return;
      this.handle?.destroy();
      this.handle = createOverlayScrollbar(this.runtime.store, options);
    });
  }

  ngOnDestroy(): void {
    this.handle?.destroy();
    this.handle = null;
  }
}
