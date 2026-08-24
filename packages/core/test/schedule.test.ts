// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createThemeStore,
  createThemeSchedule,
  createThemeRuntime,
  EMPTY_THEME_SCHEDULE_STATE,
  type ThemeDefinition,
  type ThemeScheduleState,
} from "../src";
import { ThemeKit } from "../src/vanilla";

const themes: ThemeDefinition[] = [
  { name: "day", meta: { mode: "light" } },
  { name: "night", meta: { mode: "dark" } },
  { name: "light", meta: { mode: "light", label: "Light" } },
  { name: "dark", meta: { mode: "dark", label: "Dark" } },
  { name: "plum-light", meta: { mode: "light", family: "plum" } },
  { name: "plum-dark", meta: { mode: "dark", family: "plum" } },
  { name: "mint-light", meta: { mode: "light", family: "mint" } },
  { name: "mint-dark", meta: { mode: "dark", family: "mint" } },
];

/** Deterministic solar times: sunrise 05:30 / sunset 20:30 local on whatever
 *  date is passed in, so "tomorrow" computations are testable. */
function fixedTimes(date: Date) {
  const sunrise = new Date(date);
  sunrise.setHours(5, 30, 0, 0);
  const sunset = new Date(date);
  sunset.setHours(20, 30, 0, 0);
  return { sunrise, sunset };
}

function makeSchedule(
  store: ReturnType<typeof createThemeStore<ThemeDefinition>>,
  overrides: Parameters<typeof createThemeSchedule<ThemeDefinition>>[2] = {},
) {
  return createThemeSchedule(store, themes, {
    lightTheme: "day",
    darkTheme: "night",
    latitude: 40.7128,
    longitude: -74.006,
    getTimes: fixedTimes,
    ...overrides,
  });
}

describe("createThemeSchedule — state", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is enabled and active by default with scheduled themes resolved", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store);

    expect(schedule.enabled).toBe(true);
    expect(schedule.status).toBe("active");
    expect(schedule.lightTheme).toBe("day");
    expect(schedule.darkTheme).toBe("night");
    expect(schedule.state).not.toBe(EMPTY_THEME_SCHEDULE_STATE);

    schedule.destroy();
  });

  it("during daytime the next transition is deactivation at sunset", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[1]! });
    const schedule = makeSchedule(store);

    expect(store.get().name).toBe("day");
    expect(schedule.nextTransition?.type).toBe("deactivation");
    expect(schedule.nextTransition?.theme).toBe("night");
    expect(schedule.nextTransition?.at.getTime()).toBe(
      new Date("2025-06-21T20:30:00").getTime(),
    );
    expect(schedule.nextDeactivation?.getTime()).toBe(
      new Date("2025-06-21T20:30:00").getTime(),
    );
    expect(schedule.nextActivation?.getTime()).toBe(
      new Date("2025-06-22T05:30:00").getTime(),
    );

    schedule.destroy();
  });

  it("before sunrise the next transition is activation at today's sunrise", () => {
    vi.setSystemTime(new Date("2025-06-21T03:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store);

    expect(store.get().name).toBe("night");
    expect(schedule.nextTransition?.type).toBe("activation");
    expect(schedule.nextTransition?.theme).toBe("day");
    expect(schedule.nextTransition?.at.getTime()).toBe(
      new Date("2025-06-21T05:30:00").getTime(),
    );

    schedule.destroy();
  });

  it("after sunset the next transition is activation at tomorrow's sunrise", () => {
    vi.setSystemTime(new Date("2025-06-21T23:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store);

    expect(store.get().name).toBe("night");
    expect(schedule.nextTransition?.type).toBe("activation");
    expect(schedule.nextTransition?.at.getTime()).toBe(
      new Date("2025-06-22T05:30:00").getTime(),
    );
    expect(schedule.nextActivation?.getTime()).toBe(
      new Date("2025-06-22T05:30:00").getTime(),
    );

    schedule.destroy();
  });

  it("falls back to the empty state when themes are missing", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: "missing-light",
      darkTheme: "missing-dark",
      getTimes: fixedTimes,
    });

    expect(schedule.lightTheme).toBeNull();
    expect(schedule.nextTransition).toBeNull();
    expect(schedule.status).toBe("disabled");

    schedule.destroy();
  });
});

describe("createThemeSchedule — lifecycle (enable/disable)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts disabled when enabled: false and applies on enable()", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[1]! });
    const schedule = makeSchedule(store, { enabled: false });

    expect(schedule.enabled).toBe(false);
    expect(schedule.status).toBe("disabled");
    expect(schedule.active).toBe(false);
    expect(store.get().name).toBe("night");

    schedule.enable();

    expect(schedule.enabled).toBe(true);
    expect(schedule.status).toBe("active");
    expect(schedule.active).toBe(true);
    expect(store.get().name).toBe("day");

    schedule.destroy();
  });

  it("disable() leaves the current theme untouched and stops the engine", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store, { checkInterval: 60000 });

    expect(store.get().name).toBe("day");

    schedule.disable();
    expect(schedule.enabled).toBe(false);
    expect(schedule.status).toBe("disabled");

    vi.setSystemTime(new Date("2025-06-21T21:00:00"));
    vi.advanceTimersByTime(60000);

    expect(store.get().name).toBe("day");

    schedule.destroy();
  });

  it("re-enabling snaps back to the scheduled theme", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store);

    schedule.disable();
    store.set({ name: "custom" } as ThemeDefinition, { force: true });

    expect(schedule.active).toBe(false);

    schedule.enable();

    expect(store.get().name).toBe("day");
    expect(schedule.active).toBe(true);

    schedule.destroy();
  });

  it("subscribers receive the initial snapshot and every change", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store);

    const states: ThemeScheduleState[] = [];
    const unsubscribe = schedule.subscribe((s) => states.push(s));

    expect(states).toHaveLength(1);
    expect(states[0]?.enabled).toBe(true);

    schedule.disable();
    expect(states.at(-1)?.enabled).toBe(false);

    schedule.enable();
    expect(states.at(-1)?.enabled).toBe(true);

    unsubscribe();
    const before = states.length;
    schedule.disable();
    expect(states).toHaveLength(before);

    schedule.destroy();
  });

  it("set() can reposition the schedule and recompute solar times", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });

    // A getTimes that records the coordinates it was called with.
    const calls: [number, number][] = [];
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: "day",
      darkTheme: "night",
      latitude: 40,
      longitude: -74,
      getTimes: (date, lat, lon) => {
        calls.push([lat, lon]);
        return fixedTimes(date);
      },
    });

    expect(calls[0]?.[0]).toBe(40);

    schedule.set({ latitude: -33.8688, longitude: 151.2093 });
    expect(calls.at(-1)).toEqual([-33.8688, 151.2093]);

    schedule.destroy();
  });

  it("a manual override flips active to false until the next engine tick", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = makeSchedule(store, { checkInterval: 60000 });

    expect(schedule.active).toBe(true);

    store.set({ name: "custom" } as ThemeDefinition, { force: true });
    expect(schedule.active).toBe(false);

    vi.setSystemTime(new Date("2025-06-21T15:00:00"));
    vi.advanceTimersByTime(60000);

    expect(store.get().name).toBe("day");
    expect(schedule.active).toBe(true);

    schedule.destroy();
  });
});

describe("createThemeSchedule — auto-derived light/dark themes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function fixedTimes(date: Date) {
    const sunrise = new Date(date);
    sunrise.setHours(5, 30, 0, 0);
    const sunset = new Date(date);
    sunset.setHours(20, 30, 0, 0);
    return { sunrise, sunset };
  }

  it("derives light/dark from the current theme's family when omitted", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({
      initialTheme: { name: "plum-dark", meta: { mode: "dark", family: "plum" } },
    });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: undefined,
      darkTheme: undefined,
      getTimes: fixedTimes,
    });

    expect(schedule.lightTheme).toBe("plum-light");
    expect(schedule.darkTheme).toBe("plum-dark");

    schedule.destroy();
  });

  it("falls back to neutral light/dark when the family has no counterpart", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({
      initialTheme: { name: "custom", meta: { mode: "dark", family: "custom" } },
    });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: undefined,
      darkTheme: undefined,
      getTimes: fixedTimes,
    });

    expect(schedule.lightTheme).toBe("light");
    expect(schedule.darkTheme).toBe("dark");

    schedule.destroy();
  });

  it("uses the configured lightTheme and derives dark from the current family", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({
      initialTheme: { name: "mint-dark", meta: { mode: "dark", family: "mint" } },
    });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: "mint-light",
      darkTheme: undefined,
      getTimes: fixedTimes,
    });

    expect(schedule.lightTheme).toBe("mint-light");
    expect(schedule.darkTheme).toBe("mint-dark");

    schedule.destroy();
  });

  it("re-resolves the family pair when the user switches theme family", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({
      initialTheme: { name: "plum-dark", meta: { mode: "dark", family: "plum" } },
    });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: undefined,
      darkTheme: undefined,
      getTimes: fixedTimes,
    });

    expect(schedule.lightTheme).toBe("plum-light");

    store.set({
      name: "mint-light",
      meta: { mode: "light", family: "mint" },
    } as ThemeDefinition);

    expect(schedule.lightTheme).toBe("mint-light");
    expect(schedule.darkTheme).toBe("mint-dark");

    schedule.destroy();
  });

  it("runtime.scheduled works without lightTheme/darkTheme", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "plum-light",
      scheduled: {},
    });

    expect(runtime.schedule).not.toBeNull();
    expect(runtime.schedule?.lightTheme).toBe("plum-light");
    expect(runtime.schedule?.darkTheme).toBe("plum-dark");

    runtime.destroy();
  });
});

describe("runtime.schedule", () => {
  it("exposes the schedule controller when the scheduled option is set", () => {
    vi.useFakeTimers();
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "day",
      scheduled: {
        lightTheme: "day",
        darkTheme: "night",
        latitude: 40.7128,
        longitude: -74.006,
      },
    });

    expect(runtime.schedule).not.toBeNull();
    expect(runtime.schedule?.enabled).toBe(true);
    expect(runtime.schedule?.lightTheme).toBe("day");

    runtime.schedule?.disable();
    expect(runtime.schedule?.enabled).toBe(false);

    runtime.destroy();
    vi.useRealTimers();
  });

  it("is null when the scheduled option is absent", () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "day",
    });

    expect(runtime.schedule).toBeNull();
    runtime.destroy();
  });

  it("works with ThemeKit vanilla class and automatically applies daytime/nighttime theme", () => {
    vi.setSystemTime(new Date("2025-06-21T12:00:00"));

    const kit = new ThemeKit({
      themes,
      defaultTheme: "day",
      initialMode: "system",
      scheduled: {
        lightTheme: "day",
        darkTheme: "night",
        latitude: 40.7128,
        longitude: -74.006,
        getTimes: fixedTimes,
      },
    });

    expect(kit.schedule).not.toBeNull();
    expect(kit.schedule!.enabled).toBe(true);
    expect(kit.theme.name).toBe("day");

    kit.destroy();
  });
});
