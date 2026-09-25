import { ThemeProvider, useTheme } from "@theme-kit/react";
import { themes } from "./themes";

function Switcher() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      Current theme: {theme.name} — toggle
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider themes={themes}>
      <main className="page">
        <h1>Basic ThemeKit example</h1>
        <Switcher />
      </main>
    </ThemeProvider>
  );
}