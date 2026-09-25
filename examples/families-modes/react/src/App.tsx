import {
  ThemeProvider,
  useSetThemeFamily,
  useSetThemeMode,
  useThemeFamily,
  useThemeMode,
  useToggleTheme,
} from "@theme-kit/react";
import { themes } from "./themes";

/**
 * `useThemeMode()` / `useThemeFamily()` subscribe to the selection (so this
 * component re-renders when it changes); `useSetThemeMode()` /
 * `useSetThemeFamily()` / `useToggleTheme()` return stable setters that do not.
 */
function Controls() {
  const mode = useThemeMode();
  const family = useThemeFamily();
  const setMode = useSetThemeMode();
  const setFamily = useSetThemeFamily();
  const toggle = useToggleTheme();

  return (
    <section>
      <p>
        family: <strong>{family}</strong> · mode: <strong>{mode}</strong>
      </p>
      <button type="button" onClick={() => setMode("light")}>
        Light
      </button>
      <button type="button" onClick={() => setMode("dark")}>
        Dark
      </button>
      <button type="button" onClick={() => setMode("system")}>
        System
      </button>
      <button type="button" onClick={() => setFamily("base")}>
        Select the base family
      </button>
      <button type="button" onClick={toggle}>
        Toggle light/dark
      </button>
    </section>
  );
}

export default function App() {
  return (
    <ThemeProvider themes={themes}>
      <main className="page">
        <h1>Families &amp; modes example</h1>
        <Controls />
      </main>
    </ThemeProvider>
  );
}
