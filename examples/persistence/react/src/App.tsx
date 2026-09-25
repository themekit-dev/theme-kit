import { createDefaultPersistence } from "@theme-kit/core";
import { ThemeProvider, useTheme } from "@theme-kit/react";
import { themes } from "./themes";

function Switcher() {
  const { theme, mode, toggleTheme } = useTheme();
  return (
    <section>
      <p>
        {theme.name} · {mode}
      </p>
      <button type="button" onClick={toggleTheme}>
        Toggle mode
      </button>
    </section>
  );
}

export default function App() {
  return (
    /*
      `createDefaultPersistence()` is the adapter the runtime already uses by
      default: a `localStorage`-backed selection adapter under the
      `"theme-selection"` key that also syncs across tabs via `storage` events.
      Passing it explicitly makes the dependency visible; the selection survives
      a reload. It returns `null` when storage is unavailable (e.g. SSR), which
      the provider accepts.
    */
    <ThemeProvider themes={themes} persistence={createDefaultPersistence()}>
      <main className="page">
        <h1>Persisted theme example</h1>
        <Switcher />
      </main>
    </ThemeProvider>
  );
}
