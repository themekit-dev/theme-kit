import { ThemeInspector, ThemeProvider } from "@theme-kit/react";
import { themes } from "./themes";

export default function App() {
  return (
    <ThemeProvider themes={themes}>
      <main className="page">
        <h1>DevTools inspector example</h1>
        <p>Use the floating button in the bottom-right corner.</p>

        {/*
          A floating panel that shows the active theme, its resolved tokens and
          the runtime's state. It renders in the browser only; `bottom`/`right`
          position it, and it can be hidden at build time with a flag.
        */}
        <ThemeInspector bottom={104} right={32} />
      </main>
    </ThemeProvider>
  );
}
