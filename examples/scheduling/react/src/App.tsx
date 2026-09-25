import { useState } from "react";
import { ThemeProvider, useThemeSchedule } from "@theme-kit/react";
import { themes } from "./themes";

/**
 * `useThemeSchedule()` returns the provider's schedule controller (or `null`
 * when the provider was not given a `scheduled` config). Its properties are
 * getters, so the example re-renders after toggling.
 */
function SchedulePanel() {
  const schedule = useThemeSchedule();
  const [, refresh] = useState(0);

  if (!schedule) {
    return <p>No schedule configured on the provider.</p>;
  }

  const toggle = (action: () => void) => {
    action();
    refresh((n) => n + 1);
  };

  const next = schedule.nextTransition;

  return (
    <section>
      <p>Status: {schedule.status}</p>
      <p>Sunrise: {schedule.sunrise?.toLocaleTimeString() ?? "unresolved"}</p>
      <p>Sunset: {schedule.sunset?.toLocaleTimeString() ?? "unresolved"}</p>
      <p>
        Next switch:{" "}
        {next ? `${next.theme} at ${next.at.toLocaleTimeString()}` : "—"}
      </p>
      <button type="button" onClick={() => toggle(() => schedule.enable())}>
        Enable schedule
      </button>
      <button type="button" onClick={() => toggle(() => schedule.disable())}>
        Disable schedule
      </button>
    </section>
  );
}

export default function App() {
  return (
    <ThemeProvider
      themes={themes}
      scheduled={{ lightTheme: "base-light", darkTheme: "base-dark" }}
    >
      <main className="page">
        <h1>Scheduled theme example</h1>
        <SchedulePanel />
      </main>
    </ThemeProvider>
  );
}
