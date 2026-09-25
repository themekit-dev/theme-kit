import type { CSSProperties } from "react";
import { ThemeProvider, ThemeScrollbar, useTheme } from "@theme-kit/react";

const page: CSSProperties = {
  background: "var(--theme-color-background)",
  color: "var(--theme-color-foreground)",
  minHeight: "100vh",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
  lineHeight: 1.6,
};

const card: CSSProperties = {
  background: "var(--theme-color-card)",
  border: "1px solid var(--theme-color-border)",
  borderRadius: "0.75rem",
  marginTop: "1.5rem",
  padding: "1rem",
};

const primary: CSSProperties = {
  background: "var(--theme-color-primary)",
  color: "var(--theme-color-primaryForeground)",
  border: 0,
  borderRadius: "0.5rem",
  padding: "0.5rem 1rem",
  cursor: "pointer",
};

const muted: CSSProperties = { color: "var(--theme-color-mutedForeground)" };

const scrollBox: CSSProperties = {
  background: "var(--theme-color-muted)",
  borderRadius: "0.5rem",
  height: 180,
  overflowY: "auto",
  padding: "0.75rem",
};

function Content() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main style={page}>
      <h1 style={{ margin: 0 }}>Custom scrollbar</h1>
      <p style={{ ...muted, marginTop: "0.5rem" }}>
        Theme Kit replaces the browser scrollbar with a theme-aware overlay. It
        needs no configuration: the thumb is the theme&rsquo;s{" "}
        <code>primary</code>, the track is the same colour at lower opacity, and
        both repaint when the theme changes.
      </p>

      <button style={{ ...primary, marginTop: "1rem" }} onClick={toggleTheme}>
        Toggle theme — {theme.name} ({mode})
      </button>

      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Nested scroll container</h2>
        <p style={muted}>
          The engine tracks scrollables inside the page as well, so this box gets
          its own overlay in the same colours.
        </p>
        <div style={scrollBox}>
          {Array.from({ length: 40 }, (_, i) => (
            <p key={i} style={{ margin: "0 0 0.75rem" }}>
              Scrollable row {i + 1}
            </p>
          ))}
        </div>
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Window scrollbar</h2>
        <p style={muted}>
          Scroll the page itself — the same overlay, drawn over the viewport,
          with themed arrow buttons at each end.
        </p>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: "0 0 0.75rem" }}>
            Page row {i + 1}
          </p>
        ))}
      </section>
    </main>
  );
}

export default function App() {
  return (
    // No theme props: `theme.config.ts` is the single declaration. The Vite
    // plugin derives the pre-paint script from it and transports the same
    // configuration to this provider, so the two cannot resolve differently —
    // which is what used to flash when only one side was given the mode.
    <ThemeProvider>
      {/*
        Mounted once, beside the app. The overlay covers the window and every
        scrollable inside it, so a nested container needs nothing extra.
      */}
      <ThemeScrollbar />
      <Content />
    </ThemeProvider>
  );
}
