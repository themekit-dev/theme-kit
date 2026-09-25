import { ThemeProvider, useTheme, useThemeHistory } from "@theme-kit/react";
import { themes } from "./themes";

/**
 * `useThemeHistory()` exposes the runtime's undo/redo timeline. Every theme
 * change the runtime records becomes an entry; `canUndo`/`canRedo` drive the
 * button state.
 */
function HistoryPanel() {
  const { theme, toggleTheme } = useTheme();
  const { undo, redo, canUndo, canRedo, clear } = useThemeHistory();

  return (
    <section>
      <p>Current theme: {theme.name}</p>
      <button type="button" onClick={toggleTheme}>
        Toggle
      </button>
      <button type="button" onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button type="button" onClick={redo} disabled={!canRedo}>
        Redo
      </button>
      <button type="button" onClick={clear}>
        Clear history
      </button>
    </section>
  );
}

export default function App() {
  return (
    <ThemeProvider themes={themes}>
      <main className="page">
        <h1>Theme history example</h1>
        <HistoryPanel />
      </main>
    </ThemeProvider>
  );
}
