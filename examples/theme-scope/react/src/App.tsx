import { ThemeProvider, ThemeScope, useTheme } from "@theme-kit/react";
import { themes } from "./themes";

function Switcher() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      Page theme: {theme.name} — toggle
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider themes={themes}>
      <main className="page">
        <h1>ThemeScope example</h1>
        <Switcher />

        {/*
          An exact selection: this region is always plum-dark, regardless of
          the page's theme above.
        */}
        <ThemeScope theme="plum-dark" style={{ padding: 16 }}>
          <p>Pinned to plum-dark</p>
        </ThemeScope>

        {/*
          A family-based selection: the region keeps the page's family but
          pins the mode, so it stays dark while the page is light.
        */}
        <ThemeScope family="base" mode="dark" style={{ padding: 16 }}>
          <p>base family, forced dark</p>
        </ThemeScope>
      </main>
    </ThemeProvider>
  );
}
