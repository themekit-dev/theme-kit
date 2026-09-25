import { useState } from "react";
import type { ThemeRuntimeSnapshot } from "@theme-kit/core";
import {
  ThemeProvider,
  useTheme,
  useThemeRestore,
  useThemeSnapshot,
} from "@theme-kit/react";
import { themes } from "./themes";

/**
 * `useThemeSnapshot()` returns a *capture* function; `useThemeRestore()`
 * returns a *restore* function. A snapshot is a deep, serializable copy of the
 * runtime (theme, selection, history and registry), so it can be stored
 * anywhere — here it is just held in React state.
 */
function SnapshotPanel() {
  const { theme, toggleTheme } = useTheme();
  const capture = useThemeSnapshot();
  const restore = useThemeRestore();
  const [saved, setSaved] = useState<ThemeRuntimeSnapshot | null>(null);

  return (
    <section>
      <p>Current theme: {theme.name}</p>
      <button type="button" onClick={toggleTheme}>
        Toggle
      </button>
      <button type="button" onClick={() => setSaved(capture())}>
        Capture snapshot
      </button>
      <button
        type="button"
        disabled={saved === null}
        onClick={() => {
          if (saved) restore(saved);
        }}
      >
        Restore snapshot
      </button>
      {saved && <p>Snapshot held: {saved.theme.name}</p>}
    </section>
  );
}

export default function App() {
  return (
    <ThemeProvider themes={themes}>
      <main className="page">
        <h1>Theme snapshot example</h1>
        <SnapshotPanel />
      </main>
    </ThemeProvider>
  );
}
