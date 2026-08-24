// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import {
  createOverlayScrollbar,
  createPrePaintScrollbarScript,
  createThemeScrollbar,
} from "../src/utils/overlay-scrollbar";
import { createThemeStore } from "../src/createThemeStore";
import { defineTheme } from "../src/model";

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

const theme = defineTheme({
  name: "test-theme",
  meta: { family: "test", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      primary: "#0066cc",
      border: "#e0e0e0",
      muted: "#f5f5f5",
      accent: "#e6f0ff",
    },
    radius: { lg: "8px" },
  },
});

describe("createOverlayScrollbar", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme-kit-scrollbar");
    document.documentElement.classList.remove("tk-scrollbar");
    document.documentElement.classList.remove("tk-scrollbar-ready");
    document.getElementById("tk-scrollbar-style")?.remove();
  });

  it("returns null when window is undefined", () => {
    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    expect(handle).toBeTypeOf("object");
    expect(handle).not.toBeNull();
    expect(typeof handle!.update).toBe("function");
    expect(typeof handle!.destroy).toBe("function");
    handle!.destroy();
  });

  it("creates overlay root element appended to body", () => {
    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { thickness: 10 });
    expect(handle).not.toBeNull();

    const children = Array.from(document.body.children);
    const rootElement = children.find(
      (el) =>
        el instanceof HTMLElement &&
        getComputedStyle(el).position === "fixed",
    );
    expect(rootElement).toBeDefined();

    handle!.destroy();
  });

  it("does not set data-theme-kit-scrollbar on document (bootstrap owns it)", () => {
    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    // The overlay no longer sets the attribute on <html> — the bootstrap script
    // or ThemeScrollbar component manages it.
    expect(document.documentElement.getAttribute("data-theme-kit-scrollbar")).toBeNull();
    handle!.destroy();
  });

  it("does not inject any hiding CSS (bootstrap owns it)", () => {
    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    expect(handle).not.toBeNull();

    // The overlay no longer injects any CSS — the bootstrap script
    // handles all native scrollbar hiding.
    expect(
      document.querySelectorAll(
        'style[data-theme-kit-overlay-scrollbar],style#tk-scrollbar-style',
      ).length,
    ).toBe(0);

    handle!.destroy();
  });

  it("updates thumb position on scroll", () => {
    const store = createThemeStore({ initialTheme: theme });

    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", {
      value: 2000,
      writable: true,
      configurable: true,
    });

    const handle = createOverlayScrollbar(store, {});
    expect(handle).not.toBeNull();
    handle!.update();

    const children = Array.from(document.body.children);
    const rootElement = children.find(
      (el) => el instanceof HTMLElement && getComputedStyle(el).position === "fixed",
    );
    expect(rootElement).toBeDefined();

    handle!.destroy();
  });

  it("destroy removes overlay elements", () => {
    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});

    const strips = document.querySelectorAll(".tk-scrollbar");
    expect(strips.length).toBeGreaterThan(0);

    handle!.destroy();

    // All overlay strips are removed.
    expect(document.querySelectorAll(".tk-scrollbar").length).toBe(0);
  });

  it("renders a .tk-scrollbar strip with track and thumb children", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { thickness: 10 });
    handle!.update();

    const strips = Array.from(document.querySelectorAll<HTMLElement>(".tk-scrollbar"));
    expect(strips.length).toBeGreaterThan(0);
    for (const strip of strips) {
      expect(strip.querySelector(".tk-track")).not.toBeNull();
      expect(strip.querySelector(".tk-thumb")).not.toBeNull();
    }

    handle!.destroy();
  });

  it("applies custom option values to the thumb", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { thickness: 14 });
    handle!.update();

    const thumbs = Array.from(document.querySelectorAll<HTMLElement>(".tk-thumb"));
    expect(thumbs.length).toBeGreaterThan(0);

    handle!.destroy();
  });

  it("createThemeScrollbar alias delegates to the same engine", () => {
    const store = createThemeStore({ initialTheme: theme });
    const handle = createThemeScrollbar(store, { autoHide: false });
    expect(handle).not.toBeNull();
    expect(document.querySelectorAll(".tk-scrollbar").length).toBeGreaterThan(0);
    handle!.destroy();
    expect(document.querySelectorAll(".tk-scrollbar").length).toBe(0);
  });

  it("overlays the document AND every scrollable element by default", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const inner = document.createElement("div");
    inner.className = "scrollable-inner";
    inner.style.overflowY = "auto";
    inner.style.overflowX = "auto";
    Object.defineProperty(inner, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientHeight", { value: 50, configurable: true });
    Object.defineProperty(inner, "scrollWidth", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientWidth", { value: 200, configurable: true });
    document.body.appendChild(inner);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    // root (2) + inner vertical + inner horizontal = 4 strips — inner
    // scrollables are overlaid anywhere a native scrollbar would appear.
    // The overlay may create additional strips for the same inner element
    // during rescan cycles; allow up to 6.
    const strips = Array.from(document.querySelectorAll<HTMLElement>(".tk-scrollbar"));
    expect(strips.length).toBeGreaterThanOrEqual(4);

    // The native track of the inner container is hidden automatically.
    expect(inner.getAttribute("data-theme-kit-scrollbar")).toBe("overlay");

    handle!.destroy();
    inner.remove();
  });

  it("overlays inner scrollables when explicitly included, honoring exclude", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const inner = document.createElement("div");
    inner.className = "scrollable-inner";
    inner.style.overflowY = "auto";
    inner.style.overflowX = "auto";
    Object.defineProperty(inner, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientHeight", { value: 50, configurable: true });
    Object.defineProperty(inner, "scrollWidth", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientWidth", { value: 200, configurable: true });
    document.body.appendChild(inner);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { include: [".scrollable-inner"] });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    // root (2) + inner vertical + inner horizontal = 4 strips minimum;
    // additional strips may appear during rescan cycles.
    let strips = Array.from(document.querySelectorAll<HTMLElement>(".tk-scrollbar"));
    expect(strips.length).toBeGreaterThanOrEqual(4);

    handle!.destroy();

    const handle2 = createOverlayScrollbar(store, {
      include: [".scrollable-inner"],
      exclude: [".scrollable-inner"],
    });
    handle2!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    strips = Array.from(document.querySelectorAll<HTMLElement>(".tk-scrollbar"));
    expect(strips.length).toBe(2);

    handle2!.destroy();
    inner.remove();
  });

  it("renders arrow buttons by default and hides them when arrows:false", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const withArrows = document.querySelectorAll<HTMLElement>(".tk-arrow");
    expect(withArrows.length).toBeGreaterThan(0);

    handle!.destroy();

    const handle2 = createOverlayScrollbar(store, { arrows: false });
    handle2!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    expect(document.querySelectorAll(".tk-arrow").length).toBe(0);

    handle2!.destroy();
  });

  it("hides the document scrollbar while the page is scroll-locked (body overflow hidden)", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { autoHide: false });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const rootStrips = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".tk-scrollbar.tk-v:not([data-overlay])",
      ),
    );
    expect(rootStrips.length).toBe(1);
    expect(rootStrips[0].style.display).not.toBe("none");

    // Lock the page the way modals / mobile menus do — the document scrollbar
    // must disappear so it never stacks over the fixed overlay's own strip.
    document.body.style.overflowY = "hidden";
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    const refresh = Number(document.documentElement.clientHeight); // force reflow
    expect(refresh).toBeGreaterThan(0);
    // The strip fades out before `display:none` lands; wait out the fade+hide.
    await new Promise((r) => setTimeout(r, 400));
    expect(rootStrips[0].style.display).toBe("none");

    document.body.style.overflowY = "";
    handle!.destroy();
  });

  it("does not render an overlay for a scrollable element that is hidden (opacity 0)", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const hidden = document.createElement("div");
    hidden.className = "hidden-scrollable";
    hidden.style.overflowY = "auto";
    hidden.style.opacity = "0";
    Object.defineProperty(hidden, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(hidden, "clientHeight", { value: 50, configurable: true });
    document.body.appendChild(hidden);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const strips = Array.from(document.querySelectorAll<HTMLElement>(".tk-scrollbar"));
    // The hidden scrollable should still be detected as a host (4 total),
    // but its overlay strips must be hidden so they don't appear on screen.
    expect(strips.length).toBe(4);
    const hiddenStrips = strips.filter(
      (s) => s.style.display === "none",
    );
    expect(hiddenStrips.length).toBeGreaterThan(0);

    handle!.destroy();
    hidden.remove();
  });

  it("renders visible rgba thumb and track derived from theme foreground", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    handle!.update();

    const thumb = document.querySelector<HTMLElement>(".tk-thumb");
    expect(thumb).not.toBeNull();
    // theme primary #0066cc -> rgba(0, 102, 204, ...): themed + visible
    expect(thumb!.style.background).toMatch(/rgba\(0, 102, 204,/);

    const track = document.querySelector<HTMLElement>(".tk-track");
    expect(track).not.toBeNull();
    expect(track!.style.background).toMatch(/rgba\(0, 102, 204,/);

    // arrows carry no background, only a themed glyph color
    const up = document.querySelector<HTMLElement>(".tk-arrow-up");
    expect(up).not.toBeNull();
    expect(up!.style.background).toBe("transparent");

    handle!.destroy();
  });

  it("applies custom arrow icons and keeps them hidden when arrows:false", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {
      arrowUpIcon: "<b>up</b>",
      arrowDownIcon: "<b>down</b>",
    });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const up = document.querySelector<HTMLElement>(".tk-arrow-up");
    const down = document.querySelector<HTMLElement>(".tk-arrow-down");
    expect(up).not.toBeNull();
    expect(up!.innerHTML).toBe("<b>up</b>");
    expect(down!.innerHTML).toBe("<b>down</b>");

    handle!.destroy();

    const handle2 = createOverlayScrollbar(store, { arrows: false });
    handle2!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    expect(document.querySelectorAll(".tk-arrow").length).toBe(0);
    handle2!.destroy();
  });

  it("accepts DOM nodes and arrays as arrow icons", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("data-test", "node-icon");
    const handle = createOverlayScrollbar(store, {
      arrowUpIcon: svg,
      arrowDownIcon: ["<span>a</span>", document.createTextNode("b")],
    });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const up = document.querySelector<HTMLElement>(".tk-arrow-up");
    expect(up!.querySelector("svg[data-test='node-icon']")).not.toBeNull();

    const down = document.querySelector<HTMLElement>(".tk-arrow-down");
    expect(down!.querySelector("span")?.textContent).toBe("a");
    expect(down!.textContent).toContain("b");
    expect(down!.classList.contains("tk-arrow-custom")).toBe(true);

    handle!.destroy();
  });

  it("invokes arrowIconRenderer with the correct direction for every arrow", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const calls: string[] = [];
    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {
      arrowIcon: "X",
      arrowIconRenderer: (el, dir) => {
        calls.push(dir);
        el.textContent = `icon:${dir}`;
      },
    });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    expect(calls).toEqual(expect.arrayContaining(["up", "down", "left", "right"]));
    const up = document.querySelector<HTMLElement>(".tk-arrow-up");
    expect(up!.textContent).toBe("icon:up");

    handle!.destroy();
  });

  it("positions the horizontal right arrow at the container's right edge (regression)", async () => {
    const inner = document.createElement("div");
    inner.className = "scrollable-h";
    inner.style.overflowX = "auto";
    Object.defineProperty(inner, "scrollWidth", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientWidth", { value: 200, configurable: true });
    Object.defineProperty(inner, "clientHeight", { value: 40, configurable: true });
    Object.defineProperty(inner, "offsetWidth", { value: 200, configurable: true });
    Object.defineProperty(inner, "getBoundingClientRect", {
      value: () => ({
        left: 100,
        top: 0,
        width: 200,
        height: 40,
        right: 300,
        bottom: 40,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });
    document.body.appendChild(inner);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {
      include: [".scrollable-h"],
      arrows: true,
      thickness: 8,
    });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const hRoot = document.querySelector<HTMLElement>(
      ".tk-scrollbar.tk-h[data-overlay]",
    );
    expect(hRoot).not.toBeNull();
    // New behaviour: the strip spans the full container (rect.width - offset*2),
    // so its right edge sits at rect.right - offset and the right arrow lands at
    // the true end of the scroll progress. (Fixes the arrow appearing early.)
    const rightEdge =
      parseFloat(hRoot!.style.left) + parseFloat(hRoot!.style.width);
    expect(rightEdge).toBeCloseTo(300 - 2);
    expect(hRoot!.querySelector(".tk-arrow-right")).not.toBeNull();

    handle!.destroy();
    inner.remove();
  });

  it("notches both strips at the native corner when both axes overflow", async () => {
    const inner = document.createElement("div");
    inner.className = "scrollable-both";
    inner.style.overflowY = "auto";
    inner.style.overflowX = "auto";
    Object.defineProperty(inner, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientHeight", { value: 50, configurable: true });
    Object.defineProperty(inner, "scrollWidth", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientWidth", { value: 200, configurable: true });
    Object.defineProperty(inner, "offsetWidth", { value: 200, configurable: true });
    Object.defineProperty(inner, "getBoundingClientRect", {
      value: () => ({
        left: 100,
        top: 0,
        width: 200,
        height: 50,
        right: 300,
        bottom: 50,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });
    document.body.appendChild(inner);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {
      include: [".scrollable-both"],
      thickness: 8,
    });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const hRoot = document.querySelector<HTMLElement>(
      ".tk-scrollbar.tk-h[data-overlay]",
    );
    const vRoot = document.querySelector<HTMLElement>(
      ".tk-scrollbar.tk-v[data-overlay]",
    );
    expect(hRoot).not.toBeNull();
    expect(vRoot).not.toBeNull();

    // Horizontal strip stops before the vertical strip: right edge lands at
    // rect.right - offset - thickness (it never runs under the vertical bar
    // nor pokes past the container).
    const hRight = parseFloat(hRoot!.style.left) + parseFloat(hRoot!.style.width);
    expect(hRight).toBeCloseTo(300 - 2 - 8);

    // Vertical strip stops above the horizontal strip.
    const vBottom = parseFloat(vRoot!.style.top) + parseFloat(vRoot!.style.height);
    expect(vBottom).toBeCloseTo(50 - 2 - 8);

    handle!.destroy();
    inner.remove();
  });

  it("reveals the strip immediately when a hidden scrollable becomes visible (mobile-menu open)", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const panel = document.createElement("div");
    panel.className = "reveal-panel";
    panel.style.overflowY = "auto";
    panel.style.opacity = "0";
    Object.defineProperty(panel, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(panel, "clientHeight", { value: 50, configurable: true });
    document.body.appendChild(panel);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { include: [".reveal-panel"] });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const strip = document.querySelector<HTMLElement>(".tk-scrollbar.tk-v[data-overlay]");
    const thumb = strip?.querySelector<HTMLElement>(".tk-thumb");
    // First layout records visibility only: still hidden (opacity 0), no reveal.
    expect(strip).not.toBeNull();
    expect(thumb?.style.opacity).toBe("0");
    expect(strip!.style.display).toBe("none");

    // Open the menu: the panel becomes visible and the scrollbar must reveal
    // right away — no scroll/hover required. Allow the reveal to run its
    // deferred fade-in frames.
    panel.style.opacity = "1";
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const thumb2 = strip?.querySelector<HTMLElement>(".tk-thumb");
    expect(strip!.style.display).not.toBe("none");
    expect(thumb2?.style.opacity).not.toBe("0");

    handle!.destroy();
    panel.remove();
  });

  it("reuses vertical custom icons (rotated) for horizontal arrows when left/right are not given", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const inner = document.createElement("div");
    inner.className = "scrollable-h-rot";
    inner.style.overflowX = "auto";
    inner.style.overflowY = "auto";
    Object.defineProperty(inner, "scrollWidth", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientWidth", { value: 200, configurable: true });
    Object.defineProperty(inner, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientHeight", { value: 50, configurable: true });
    Object.defineProperty(inner, "offsetWidth", { value: 200, configurable: true });
    Object.defineProperty(inner, "getBoundingClientRect", {
      value: () => ({
        left: 100,
        top: 0,
        width: 200,
        height: 50,
        right: 300,
        bottom: 50,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });
    document.body.appendChild(inner);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {
      arrowUpIcon: "<b>u</b>",
      arrowDownIcon: "<b>d</b>",
      include: [".scrollable-h-rot"],
    });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const left = document.querySelector<HTMLElement>(".tk-arrow-left");
    const right = document.querySelector<HTMLElement>(".tk-arrow-right");
    expect(left).not.toBeNull();
    expect(left!.classList.contains("tk-arrow-custom")).toBe(true);
    const leftGlyph = left!.querySelector<HTMLElement>(".tk-arrow-glyph-rot");
    expect(leftGlyph).not.toBeNull();
    expect(leftGlyph!.textContent).toBe("u");
    expect(leftGlyph!.style.transform).toBe("rotate(-90deg)");

    expect(right).not.toBeNull();
    expect(right!.classList.contains("tk-arrow-custom")).toBe(true);
    const rightGlyph = right!.querySelector<HTMLElement>(".tk-arrow-glyph-rot");
    expect(rightGlyph).not.toBeNull();
    expect(rightGlyph!.textContent).toBe("u");
    expect(rightGlyph!.style.transform).toBe("rotate(90deg)");

    handle!.destroy();
    inner.remove();
  });

  it("keeps overlay strips below page overlays by default, adopting container z-index", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const inner = document.createElement("div");
    inner.className = "scrollable-z";
    inner.style.overflowY = "auto";
    inner.style.zIndex = "15";
    inner.style.position = "relative";
    Object.defineProperty(inner, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(inner, "clientHeight", { value: 50, configurable: true });
    document.body.appendChild(inner);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { include: [".scrollable-z"] });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    // Document scrollbar: above sticky headers so the page's own scrollbar
    // stays visible over them (but below full-screen overlay backdrops).
    const rootStrips = Array.from(
      document.querySelectorAll<HTMLElement>(".tk-scrollbar:not([data-overlay])"),
    );
    expect(rootStrips.length).toBeGreaterThan(0);
    for (const strip of rootStrips) {
      expect(Number(strip.style.zIndex)).toBe(55);
    }

    // Inner scrollbar: adopts the container's declared z-index (15).
    const overlayStrips = Array.from(
      document.querySelectorAll<HTMLElement>(".tk-scrollbar[data-overlay]"),
    );
    expect(overlayStrips.length).toBeGreaterThan(0);
    for (const strip of overlayStrips) {
      expect(Number(strip.style.zIndex)).toBe(15);
    }

    handle!.destroy();
    inner.remove();
  });

  it("respects an explicit zIndex option over the resolved value", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, { zIndex: 60 });
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const strips = Array.from(
      document.querySelectorAll<HTMLElement>(".tk-scrollbar:not([data-overlay])"),
    );
    expect(strips.length).toBeGreaterThan(0);
    for (const strip of strips) {
      expect(Number(strip.style.zIndex)).toBe(60);
    }

    handle!.destroy();
  });

  it("re-measures content growth on mutation without waiting for the periodic rescan (navigation regression)", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
    const container = document.createElement("div");
    container.className = "growing-container";
    container.style.overflowY = "auto";
    // Initially the content fits: no overlay should be created.
    Object.defineProperty(container, "scrollHeight", { value: 50, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(container, "scrollWidth", { value: 200, configurable: true });
    Object.defineProperty(container, "clientWidth", { value: 200, configurable: true });
    document.body.appendChild(container);

    const store = createThemeStore({ initialTheme: theme });
    const handle = createOverlayScrollbar(store, {});
    handle!.update();
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    const overlaysBefore = document.querySelectorAll<HTMLElement>(
      ".tk-scrollbar[data-overlay]",
    );
    expect(overlaysBefore.length).toBe(0);

    // Simulate a navigation: new content makes the container overflow. No
    // class/style attribute changes on the container itself — a plain
    // childList mutation (like React swapping children) is all the observer sees.
    Object.defineProperty(container, "scrollHeight", { value: 500, configurable: true });
    container.appendChild(document.createElement("span"));
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    // The overlay must appear immediately from the mutation-triggered rescan,
    // not only after the 4s periodic full recompute.
    const visibleOverlays = Array.from(
      document.querySelectorAll<HTMLElement>(".tk-scrollbar[data-overlay]"),
    ).filter((s) => s.style.display !== "none");
    expect(visibleOverlays.length).toBe(1);
    expect(visibleOverlays[0].classList.contains("tk-v")).toBe(true);

    handle!.destroy();
    container.remove();
  });
});

describe("createPrePaintScrollbarScript", () => {
  afterEach(() => {
    document.documentElement.classList.remove("tk-scrollbar");
    document.getElementById("tk-scrollbar-style")?.remove();
    (window as any).matchMedia = undefined;
  });

  it("emits a script that injects hiding CSS and adds tk-scrollbar class", () => {
    const script = createPrePaintScrollbarScript();
    expect(script).toContain("tk-scrollbar");
    expect(script).toContain("scrollbar-width");
    expect(script).toContain("tk-scrollbar-style");
  });

  it("hides native scrollbar when executed", () => {
    eval(createPrePaintScrollbarScript());
    expect(document.documentElement.classList.contains("tk-scrollbar")).toBe(true);
    const style = document.getElementById("tk-scrollbar-style");
    expect(style).not.toBeNull();
    const css = style!.textContent ?? "";
    expect(css).toContain("scrollbar-width:none");
    expect(css).toContain("::-webkit-scrollbar");
  });

  it("is idempotent — a second run does not duplicate the style", () => {
    eval(createPrePaintScrollbarScript());
    eval(createPrePaintScrollbarScript());
    expect(document.querySelectorAll("#tk-scrollbar-style").length).toBe(1);
  });

  it("leaves native scrollbars on coarse pointers unless touch is opted in", () => {
    (window as any).matchMedia = () => ({ matches: true });
    eval(createPrePaintScrollbarScript());
    expect(document.documentElement.classList.contains("tk-scrollbar")).toBe(false);

    eval(createPrePaintScrollbarScript({ touch: true }));
    expect(document.documentElement.classList.contains("tk-scrollbar")).toBe(true);
  });
});