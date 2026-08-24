import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
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
 */
@Directive({
  selector: "[themeKitScrollbar]",
  standalone: true,
})
export class ThemeScrollbarDirective implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private runtime = inject<ThemeRuntime<ThemeDefinition>>(THEME_KIT_RUNTIME);

  @Input("themeKitScrollbarOptions") options: OverlayScrollbarOptions = {};

  private handle: OverlayScrollbarHandle | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.handle = createOverlayScrollbar(this.runtime.store, this.options);
  }

  ngOnDestroy(): void {
    this.handle?.destroy();
    this.handle = null;
  }
}
