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
    /*
      `transition` accepts `false` (off), `true` (defaults) or a
      `ThemeTransitionOptions` object. Here the fade is slowed down and given a
      different easing; the CSS custom properties interpolate between themes.
    */
    <ThemeProvider
      themes={themes}
      transition={{ duration: 600, easing: "ease-in-out" }}
    >
      <main className="page">
        <h1>Theme transition example</h1>
        <Switcher />
      </main>
    </ThemeProvider>
  );
}
