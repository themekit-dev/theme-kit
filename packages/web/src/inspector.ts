import {
  themeToCSSVariables,
  type ThemeDefinition,
  type ThemeRuntime,
} from "@theme-kit/core";
import { findProviderRuntime } from "./utils";

/**
 * Framework-agnostic Theme Inspector.
 *
 * `<theme-kit-inspector>` works in any framework (or plain HTML): render it
 * inside a `<theme-kit-provider>` and it shows a floating toggle that opens a
 * panel inspecting the active theme — identity, selection, tokens, and the
 * resolved CSS variables — live.
 *
 * Attributes:
 * - `bottom` (default 104): distance from the bottom of the viewport, in px.
 * - `right`  (default 32):  distance from the right edge, in px.
 * - `size`   (default 40):  toggle button size, in px.
 * - `z-index` (default 9999): stacking order for the toggle and panel.
 */

const DEFAULT_BOTTOM = 104;
const DEFAULT_RIGHT = 32;
const DEFAULT_SIZE = 40;
const DEFAULT_Z_INDEX = 9999;

const EYE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const X_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

function flattenTokens(
  obj: Record<string, unknown> | undefined,
  prefix = "",
): [string, string][] {
  if (!obj) return [];
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      entries.push(...flattenTokens(value as Record<string, unknown>, path));
    } else if (typeof value === "string") {
      entries.push([path, value]);
    }
  }
  return entries;
}

function isColorValue(value: string): boolean {
  return /^(#|rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|hwb|color-mix|light-dark)/i.test(
    value.trim(),
  );
}

function entryRow(path: string, value: string): string {
  const swatch = isColorValue(value)
    ? `<span style="width:10px;height:10px;border-radius:3px;flex-shrink:0;background:${value};border:1px solid var(--theme-color-border);box-shadow:inset 0 0 0 1px rgba(0,0,0,0.06);" aria-hidden="true"></span>`
    : "";
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11.5px;padding:3px 4px;border-radius:6px;font-family:var(--font-mono, ui-monospace, monospace);">
    <span title="${path}" style="color:var(--theme-color-muted-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">${path}</span>
    <span style="display:flex;align-items:center;gap:6px;min-width:0;max-width:60%;justify-content:flex-end;">${swatch}<span title="${value}" style="color:var(--theme-color-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${value}</span></span>
  </div>`;
}

function sectionHeader(label: string, count?: number): string {
  return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">
    <span style="width:3px;height:12px;border-radius:2px;background:var(--theme-color-primary);opacity:0.75;flex-shrink:0;"></span>
    <span style="font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.09em;color:var(--theme-color-muted-foreground);">${label}</span>
    ${
      typeof count === "number"
        ? `<span style="margin-left:auto;font-size:10px;font-family:var(--font-mono, ui-monospace, monospace);color:var(--theme-color-muted-foreground);opacity:0.65;">${count}</span>`
        : ""
    }
  </div>`;
}

export class ThemeKitInspector extends HTMLElement {
  static observedAttributes = ["bottom", "right", "size", "z-index"];

  private unsubscribe: (() => void) | null = null;
  private open = false;
  private toggleEl: HTMLButtonElement | null = null;
  private panelEl: HTMLDivElement | null = null;
  private rootEl: HTMLDivElement | null = null;

  private bottom = DEFAULT_BOTTOM;
  private right = DEFAULT_RIGHT;
  private size = DEFAULT_SIZE;
  private zIndex = DEFAULT_Z_INDEX;

  connectedCallback() {
    this.parseAttributes();
    const runtime = findProviderRuntime(this);
    if (!runtime) {
      this.addEventListener("theme-ready", () => this.init(), { once: true });
      return;
    }
    this.init();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    window.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("pointerdown", this.handlePointerDown);
    this.innerHTML = "";
    this.open = false;
  }

  attributeChangedCallback() {
    this.parseAttributes();
    if (this.isConnected) {
      const runtime = findProviderRuntime(this);
      if (runtime) this.render(runtime);
    }
  }

  private parseAttributes() {
    this.bottom = parseIntAttr(this.getAttribute("bottom"), DEFAULT_BOTTOM);
    this.right = parseIntAttr(this.getAttribute("right"), DEFAULT_RIGHT);
    this.size = parseIntAttr(this.getAttribute("size"), DEFAULT_SIZE);
    this.zIndex = parseIntAttr(this.getAttribute("z-index"), DEFAULT_Z_INDEX);
  }

  private init() {
    const runtime = findProviderRuntime(this);
    if (!runtime) return;
    this.render(runtime);
    this.unsubscribe = runtime.store.subscribe(() =>
      this.updatePanel(runtime),
    );
    window.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("pointerdown", this.handlePointerDown);
  }

  private render(runtime: ThemeRuntime<ThemeDefinition>) {
    this.innerHTML = "";
    this.open = false;
    this.rootEl = document.createElement("div");

    const size = this.size;

    this.toggleEl = document.createElement("button");
    this.toggleEl.type = "button";
    this.toggleEl.setAttribute("part", "inspector-toggle");
    this.toggleEl.setAttribute("aria-label", "Open theme inspector");
    this.toggleEl.setAttribute("aria-expanded", "false");
    this.toggleEl.title = "Toggle Theme Inspector";
    this.toggleEl.style.cssText = `position:fixed;bottom:${this.bottom}px;right:${this.right}px;width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.3)}px;background:color-mix(in srgb, var(--theme-color-primary) 80%, transparent);color:var(--theme-color-primary-foreground, var(--theme-color-primaryForeground));border:1px solid var(--theme-color-border);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px -8px color-mix(in srgb, var(--theme-color-primary) 60%, transparent);z-index:${this.zIndex};font-size:16px;transition:transform 150ms cubic-bezier(0.16,1,0.3,1);`;
    this.toggleEl.innerHTML = EYE_ICON;
    this.toggleEl.addEventListener("click", () => this.toggle(runtime));
    this.toggleEl.addEventListener("mouseenter", () => {
      if (this.toggleEl) this.toggleEl.style.transform = "scale(1.06)";
    });
    this.toggleEl.addEventListener("mouseleave", () => {
      if (this.toggleEl) this.toggleEl.style.transform = "scale(1)";
    });

    const panelBottom = this.bottom + size + 8;
    const panelMaxHeight = `min(480px, calc(100vh - ${panelBottom + 56}px))`;

    this.panelEl = document.createElement("div");
    this.panelEl.setAttribute("part", "inspector-panel");
    this.panelEl.setAttribute("role", "dialog");
    this.panelEl.setAttribute("aria-label", "Theme inspector");
    this.panelEl.tabIndex = -1;
    this.panelEl.style.cssText = `position:fixed;bottom:${panelBottom}px;right:${this.right}px;width:320px;max-height:${panelMaxHeight};overflow-y:auto;overscroll-behavior:contain;background:color-mix(in srgb, var(--theme-color-card) 92%, transparent);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);border:1px solid var(--theme-color-border);border-radius:14px;box-shadow:0 24px 64px -24px rgba(0,0,0,0.45);padding:14px 20px 16px 16px;font-family:var(--font-sans, system-ui, sans-serif);font-size:12px;color:var(--theme-color-foreground);z-index:${this.zIndex};opacity:0;visibility:hidden;pointer-events:none;transition:opacity 200ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1);transform-origin:bottom right;`;

    this.rootEl.appendChild(this.toggleEl);
    this.rootEl.appendChild(this.panelEl);
    this.appendChild(this.rootEl);

    this.updatePanel(runtime);
  }

  private toggle(runtime: ThemeRuntime<ThemeDefinition>) {
    this.open = !this.open;
    if (!this.toggleEl || !this.panelEl) return;
    this.toggleEl.setAttribute("aria-expanded", String(this.open));
    this.toggleEl.setAttribute("aria-label", this.open ? "Close theme inspector" : "Open theme inspector");
    this.toggleEl.innerHTML = this.open ? X_ICON : EYE_ICON;
    this.toggleEl.style.background = this.open
      ? "var(--theme-color-muted)"
      : "color-mix(in srgb, var(--theme-color-primary) 80%, transparent)";
    this.toggleEl.style.color = this.open
      ? "var(--theme-color-foreground)"
      : "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))";
    this.panelEl.style.opacity = this.open ? "1" : "0";
    this.panelEl.style.transform = this.open
      ? "translateY(0) scale(1)"
      : "translateY(12px) scale(0.96)";
    this.panelEl.style.visibility = this.open ? "visible" : "hidden";
    this.panelEl.style.pointerEvents = this.open ? "auto" : "none";
    if (this.open) this.panelEl.focus();
  }

  private updatePanel(runtime: ThemeRuntime<ThemeDefinition>) {
    if (!this.panelEl) return;
    const theme = runtime.store.get();
    const selection = runtime.selection.getSelection();
    const mode = runtime.selection.getMode();
    const family = runtime.selection.getFamily();
    const vars = themeToCSSVariables(theme);
    const tokenEntries = flattenTokens(theme.tokens as Record<string, unknown>);

    const identityChips = (value: string, accent = false) =>
      `<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;text-transform:capitalize;font-family:var(--font-sans, system-ui, sans-serif);background:${
        accent
          ? "color-mix(in srgb, var(--theme-color-primary) 14%, transparent)"
          : "var(--theme-color-muted)"
      };color:${
        accent
          ? "var(--theme-color-primary)"
          : "var(--theme-color-muted-foreground)"
      };border:1px solid var(--theme-color-border);">${value}</span>`;

    const tokensRows = tokenEntries
      .slice(0, 16)
      .map(([path, value]) => entryRow(path, value))
      .join("");
    const cssRows = Object.entries(vars)
      .slice(0, 8)
      .map(([key, value]) => entryRow(key, value))
      .join("");

    this.panelEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-right:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:var(--theme-color-card);box-shadow:0 0 0 3px color-mix(in srgb, var(--theme-color-primary) 22%, transparent);"></span>
          <span style="font-weight:700;font-size:12px;letter-spacing:0.01em;">Theme Inspector</span>
        </div>
        <button type="button" data-close style="background:transparent;border:1px solid transparent;border-radius:7px;cursor:pointer;font-size:14px;line-height:1;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:var(--theme-color-muted-foreground);">${X_ICON}</button>
      </div>
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:10px;padding-right:8px;">
        <span style="font-size:12.5px;font-weight:600;color:var(--theme-color-foreground);margin-right:2px;">${theme.name}</span>
        ${identityChips(family)}
        ${identityChips(mode, true)}
      </div>
      <div style="height:1px;margin:14px 0 0;background:linear-gradient(90deg, var(--theme-color-border), transparent);"></div>
      <section style="margin-top:16px;">${sectionHeader("Theme")}
        ${entryRow("Name", String(theme.name))}
        ${entryRow("Family", family)}
        ${entryRow("Mode", mode)}
      </section>
      <section style="margin-top:16px;">${sectionHeader("Selection")}
        ${entryRow("family", selection.family)}
        ${entryRow("mode", selection.mode)}
      </section>
      <section style="margin-top:16px;">${sectionHeader("Tokens", tokenEntries.length)}
        ${tokensRows}
        ${
          tokenEntries.length > 16
            ? `<div style="color:var(--theme-color-muted-foreground);font-size:10.5px;margin-top:4px;padding-left:4px;">+${tokenEntries.length - 16} more</div>`
            : ""
        }
      </section>
      <section style="margin-top:16px;">${sectionHeader("CSS Variables", Object.keys(vars).length)}
        ${cssRows}
        ${
          Object.keys(vars).length > 8
            ? `<div style="color:var(--theme-color-muted-foreground);font-size:10.5px;margin-top:4px;padding-left:4px;">+${Object.keys(vars).length - 8} more</div>`
            : ""
        }
      </section>
    `;

    const closeBtn = this.panelEl.querySelector<HTMLButtonElement>("[data-close]");
    closeBtn?.addEventListener("click", () => this.close());
  }

  private close() {
    if (!this.open) return;
    this.open = false;
    if (this.toggleEl) {
      this.toggleEl.setAttribute("aria-expanded", "false");
      this.toggleEl.setAttribute("aria-label", "Open theme inspector");
      this.toggleEl.innerHTML = EYE_ICON;
      this.toggleEl.style.background =
        "color-mix(in srgb, var(--theme-color-primary) 80%, transparent)";
      this.toggleEl.style.color =
        "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))";
    }
    if (this.panelEl) {
      this.panelEl.style.opacity = "0";
      this.panelEl.style.transform = "translateY(12px) scale(0.96)";
      this.panelEl.style.visibility = "hidden";
      this.panelEl.style.pointerEvents = "none";
    }
    this.toggleEl?.focus();
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    const active = document.activeElement;
    const inside =
      this.panelEl?.contains(active) || this.toggleEl === active;
    if (inside) this.close();
  };

  private handlePointerDown = (event: PointerEvent) => {
    if (!this.open) return;
    if (this.rootEl?.contains(event.target as Node)) return;
    this.close();
  };

  static define(tag = "theme-kit-inspector") {
    // SSR-safe: customElements only exists in the browser. Framework wrappers
    // (Vue, Solid, Angular, Astro, …) call define() from both server and
    // client environments, so this must be a no-op on the server.
    if (typeof customElements === "undefined") return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitInspector);
    }
  }
}

function parseIntAttr(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
