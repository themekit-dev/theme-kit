function escapeHTML(str: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return str.replace(/[&<>"']/g, (c) => map[c] ?? c);
}

function renderEntries(entries: unknown[]): string {
  if (entries.length === 0) return "<p class='tk-devtools-empty'>No entries recorded.</p>";
  return entries.map((e: any, i: number) => `
    <div class="tk-devtools-entry">
      <span class="tk-devtools-time">${new Date(e.timestamp).toLocaleTimeString()}</span>
      <span class="tk-devtools-type tk-type-${e.type}">${escapeHTML(e.type)}</span>
      <span class="tk-devtools-label">${escapeHTML(e.label)}</span>
    </div>
  `).join("");
}

function renderPerformance(perf: unknown[]): string {
  if (perf.length === 0) return "<p class='tk-devtools-empty'>No performance data.</p>";
  const maxDur = Math.max(...perf.map((p: any) => p.duration), 1);
  return perf.map((p: any) => `
    <div class="tk-devtools-perf-row">
      <span class="tk-devtools-perf-type">${escapeHTML(p.type)}</span>
      <div class="tk-devtools-bar-wrap">
        <div class="tk-devtools-bar" style="width:${(p.duration / maxDur) * 100}%"></div>
      </div>
      <span class="tk-devtools-perf-val">${p.duration.toFixed(2)}ms</span>
    </div>
  `).join("");
}

function renderCSSVariables(vars: Record<string, string>): string {
  const entries = Object.entries(vars);
  if (entries.length === 0) return "<p class='tk-devtools-empty'>No CSS variables.</p>";
  return entries.map(([key, val]) => `
    <div class="tk-devtools-css-row">
      <span class="tk-devtools-css-prop">${escapeHTML(key)}</span>
      <span class="tk-devtools-css-val">${escapeHTML(val)}</span>
      <span class="tk-devtools-css-swatch" style="background:${val}"></span>
    </div>
  `).join("");
}

export function createDevToolsPanel(inspector: {
  getState(): { currentTheme: unknown; selection: unknown; history: unknown[]; cssVariables: Record<string, string> };
  getEntries(): unknown[];
  getPerformance(): unknown[];
  jump(index: number): void;
  clearEntries(): void;
  clearPerformance(): void;
  exportState(): string;
  exportCSS(): Record<string, string>;
  destroy(): void;
}): HTMLElement {
  const root = document.createElement("div");
  root.className = "tk-devtools";
  root.setAttribute("role", "complementary");
  root.setAttribute("aria-label", "Theme Kit DevTools");

  let currentTab = "inspector";

  function render() {
    const state = inspector.getState();
    root.innerHTML = `
      <div class="tk-devtools-header">
        <h3>Theme Kit DevTools</h3>
        <nav class="tk-devtools-tabs">
          <button class="tk-tab ${currentTab === "inspector" ? "active" : ""}" data-tab="inspector">Inspector</button>
          <button class="tk-tab ${currentTab === "events" ? "active" : ""}" data-tab="events">Events</button>
          <button class="tk-tab ${currentTab === "performance" ? "active" : ""}" data-tab="performance">Perf</button>
          <button class="tk-tab ${currentTab === "css" ? "active" : ""}" data-tab="css">CSS Vars</button>
          <button class="tk-tab ${currentTab === "history" ? "active" : ""}" data-tab="history">History</button>
        </nav>
      </div>
      <div class="tk-devtools-body">
        ${renderTab(state)}
      </div>
      <div class="tk-devtools-footer">
        <button id="tk-clear-entries">Clear Events</button>
        <button id="tk-clear-perf">Clear Perf</button>
        <button id="tk-export-json">Export JSON</button>
        <button id="tk-export-css">Export CSS</button>
      </div>
    `;

    root.querySelectorAll(".tk-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentTab = (btn as HTMLButtonElement).dataset.tab!;
        render();
      });
    });

    const clearBtn = root.querySelector("#tk-clear-entries") as HTMLButtonElement;
    if (clearBtn) clearBtn.addEventListener("click", () => inspector.clearEntries());

    const perfBtn = root.querySelector("#tk-clear-perf") as HTMLButtonElement;
    if (perfBtn) perfBtn.addEventListener("click", () => inspector.clearPerformance());

    const jsonBtn = root.querySelector("#tk-export-json") as HTMLButtonElement;
    if (jsonBtn) jsonBtn.addEventListener("click", () => {
      const blob = new Blob([inspector.exportState()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "theme-kit-state.json"; a.click();
      URL.revokeObjectURL(url);
    });

    const cssBtn = root.querySelector("#tk-export-css") as HTMLButtonElement;
    if (cssBtn) cssBtn.addEventListener("click", () => {
      const cssVars = inspector.exportCSS();
      const css = Object.entries(cssVars).map(([k, v]) => `${k}: ${v};`).join("\n  ");
      const blob = new Blob([`/* Theme Kit CSS Variables */\n:root {\n  ${css}\n}`], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "theme-kit.css"; a.click();
      URL.revokeObjectURL(url);
    });
  }

  function renderTab(state: any): string {
    const history = (state.history ?? []) as Array<{ index: number }>;
    const cssVars = (state.cssVariables ?? {}) as Record<string, string>;
    switch (currentTab) {
      case "inspector":
        return `
          <section class="tk-devtools-section">
            <h4>Current Theme</h4>
            <pre>${escapeHTML(JSON.stringify(state.currentTheme, null, 2))}</pre>
          </section>
          <section class="tk-devtools-section">
            <h4>Selection</h4>
            <pre>${escapeHTML(JSON.stringify(state.selection, null, 2))}</pre>
          </section>
        `;
      case "events":
        return `<section class="tk-devtools-section"><h4>Lifecycle Events</h4>${renderEntries(inspector.getEntries())}</section>`;
      case "performance":
        return `<section class="tk-devtools-section"><h4>Performance</h4>${renderPerformance(inspector.getPerformance())}</section>`;
      case "css":
        return `<section class="tk-devtools-section"><h4>CSS Variables</h4>${renderCSSVariables(state.cssVariables || {})}</section>`;
      case "history":
        return `
          <section class="tk-devtools-section">
            <h4>History (${state.history.length} entries)</h4>
            <div class="tk-devtools-history">
              ${state.history.map((h: any) => `
                <div class="tk-devtools-history-entry">
                  <span>#${h.index}</span>
                  <button data-jump="${h.index}">Jump</button>
                </div>
              `).join("")}
            </div>
          </section>
        `;
      default:
        return "";
    }
  }

  root.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.tab) {
      currentTab = target.dataset.tab;
      render();
    }
    if (target.dataset.jump !== undefined) {
      inspector.jump(Number(target.dataset.jump));
    }
  });

  render();
  return root;
}
