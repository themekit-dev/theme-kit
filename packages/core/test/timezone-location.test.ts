// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  calculateSunTimes,
  createThemeRuntime,
  createThemeSchedule,
  createThemeStore,
  getLocationForTimeZone,
  getTimeZoneList,
  resolveSolarLocation,
  type ThemeDefinition,
} from "../src";

const themes: ThemeDefinition[] = [
  { name: "day", meta: { mode: "light" } },
  { name: "night", meta: { mode: "dark" } },
];

describe("timezone location resolution", () => {
  it("resolves a known IANA timezone to its reference coordinates", () => {
    expect(getLocationForTimeZone("Asia/Kathmandu")).toEqual([27.72, 85.32]);
    expect(getLocationForTimeZone("America/New_York")).toEqual([40.71, -74.01]);
    expect(getLocationForTimeZone("Australia/Sydney")).toEqual([-33.87, 151.21]);
  });

  it("normalizes legacy IANA aliases (Chrome reports Asia/Katmandu)", () => {
    expect(getLocationForTimeZone("Asia/Katmandu")).toEqual([27.72, 85.32]);
    expect(getLocationForTimeZone("Asia/Calcutta")).toEqual([22.57, 88.37]);
    expect(getLocationForTimeZone("US/Eastern")).toEqual([40.71, -74.01]);
    expect(getLocationForTimeZone("Europe/Kiev")).toEqual([50.45, 30.52]);
    expect(getLocationForTimeZone("America/Buenos_Aires")).toEqual([
      -34.6, -58.38,
    ]);
  });

  it("derives Etc/GMT±n zones from the UTC offset", () => {
    expect(getLocationForTimeZone("Etc/GMT+5")).toEqual([0, -75]);
    expect(getLocationForTimeZone("Etc/GMT-9")).toEqual([0, 135]);
  });

  it("returns null for unknown zones", () => {
    expect(getLocationForTimeZone("Mars/Olympus_Mons")).toBeNull();
  });

  it("lists every known zone sorted alphabetically", () => {
    const zones = getTimeZoneList();
    expect(zones.length).toBeGreaterThan(200);
    expect(zones[0]).toBe("Africa/Abidjan");
    expect([...zones].sort((a, b) => a.localeCompare(b))).toEqual(zones);
  });

  it("uses explicit coordinates when both are provided", () => {
    expect(
      resolveSolarLocation({ latitude: 40.7, longitude: -74 }),
    ).toEqual({
      latitude: 40.7,
      longitude: -74,
      timeZone: null,
      autoDetected: false,
    });
  });

  it("resolves coordinates from an explicit timezone", () => {
    const resolved = resolveSolarLocation({ timeZone: "Asia/Tokyo" });
    expect(resolved.latitude).toBeCloseTo(35.68);
    expect(resolved.longitude).toBeCloseTo(139.77);
    expect(resolved.timeZone).toBe("Asia/Tokyo");
    expect(resolved.autoDetected).toBe(true);
  });

  it("explicit coordinates win over a timezone", () => {
    const resolved = resolveSolarLocation({
      latitude: 51.5,
      longitude: -0.13,
      timeZone: "Asia/Tokyo",
    });
    expect(resolved.latitude).toBeCloseTo(51.5);
    expect(resolved.longitude).toBeCloseTo(-0.13);
  });

  it("detects the browser timezone on the client", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      timeZone: "Asia/Kathmandu",
    } as Intl.ResolvedDateTimeFormatOptions);

    const resolved = resolveSolarLocation({});
    expect(resolved.timeZone).toBe("Asia/Kathmandu");
    expect(resolved.latitude).toBeCloseTo(27.72);
    expect(resolved.autoDetected).toBe(true);
  });

  it("falls back to defaults when nothing can be resolved", () => {
    const resolved = resolveSolarLocation({
      autoDetectLocation: false,
      timeZone: "Mars/Olympus_Mons",
    });
    expect(resolved).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
      timeZone: "Mars/Olympus_Mons",
      autoDetected: false,
    });
  });

  it("can be disabled entirely to keep SSR deterministic", () => {
    const resolved = resolveSolarLocation({ autoDetectLocation: false });
    expect(resolved).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
      timeZone: null,
      autoDetected: false,
    });
  });
});

describe("calculateSunTimes with optional coordinates", () => {
  it("keeps working with explicit coordinates (backwards compatible)", () => {
    const date = new Date("2025-06-21T12:00:00Z");
    const { sunrise, sunset } = calculateSunTimes(date, 40.7128, -74.006);
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
  });

  it("resolves coordinates from an explicit timezone", () => {
    const date = new Date("2025-06-21T12:00:00Z");
    const { sunrise, sunset } = calculateSunTimes(date, {
      timeZone: "Asia/Kathmandu",
    });
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
  });

  it("produces deterministic results with auto-detection disabled", () => {
    const date = new Date("2025-06-21T12:00:00Z");
    const withDefault = calculateSunTimes(date, {
      autoDetectLocation: false,
    });
    const withExplicit = calculateSunTimes(date, 40.7128, -74.006);
    expect(withDefault.sunrise.getTime()).toBe(withExplicit.sunrise.getTime());
  });
});

describe("theme schedule with timezone resolution", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves coordinates from timeZone when latitude/longitude are omitted", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: "day",
      darkTheme: "night",
      timeZone: "Asia/Kathmandu",
      getTimes: (date, lat, lon) => {
        const sunrise = new Date(date);
        sunrise.setHours(5, 30, 0, 0);
        const sunset = new Date(date);
        sunset.setHours(20, 30, 0, 0);
        return { sunrise, sunset };
      },
    });

    expect(schedule.timeZone).toBe("Asia/Kathmandu");
    expect(schedule.latitude).toBeCloseTo(27.72);
    expect(schedule.longitude).toBeCloseTo(85.32);
    expect(schedule.autoDetected).toBe(true);

    schedule.destroy();
  });

  it("repositions via set({ timeZone }) and switches back to explicit coords", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });

    let calls: [number, number][] = [];
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: "day",
      darkTheme: "night",
      latitude: 40,
      longitude: -74,
      getTimes: (date, lat, lon) => {
        calls.push([lat, lon]);
        const sunrise = new Date(date);
        sunrise.setHours(5, 30, 0, 0);
        const sunset = new Date(date);
        sunset.setHours(20, 30, 0, 0);
        return { sunrise, sunset };
      },
    });

    expect(schedule.latitude).toBe(40);
    expect(schedule.timeZone).toBeNull();

    // Switch to a timezone — coordinates follow it.
    schedule.set({ timeZone: "Australia/Sydney" });
    expect(schedule.timeZone).toBe("Australia/Sydney");
    expect(schedule.latitude).toBeCloseTo(-33.87);
    expect(schedule.autoDetected).toBe(true);

    // Explicit coordinates take over again.
    schedule.set({ latitude: 51.5, longitude: -0.13 });
    expect(schedule.timeZone).toBeNull();
    expect(schedule.latitude).toBeCloseTo(51.5);

    schedule.destroy();
  });

  it("reports timeZone/latitude/longitude/autoDetected in state", () => {
    vi.setSystemTime(new Date("2025-06-21T14:00:00"));
    const store = createThemeStore({ initialTheme: themes[0]! });
    const schedule = createThemeSchedule(store, themes, {
      lightTheme: "day",
      darkTheme: "night",
      timeZone: "Europe/London",
      getTimes: (date) => {
        const sunrise = new Date(date);
        sunrise.setHours(5, 30, 0, 0);
        const sunset = new Date(date);
        sunset.setHours(20, 30, 0, 0);
        return { sunrise, sunset };
      },
    });

    expect(schedule.state.timeZone).toBe("Europe/London");
    expect(schedule.state.autoDetected).toBe(true);
    expect(schedule.state.latitude).toBeCloseTo(51.51);

    schedule.destroy();
  });

  it("runtime.scheduled auto-detects the visitor timezone in jsdom", () => {
    vi.setSystemTime(new Date("2025-06-21T12:00:00"));
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      timeZone: "Asia/Kathmandu",
    } as Intl.ResolvedDateTimeFormatOptions);

    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "day",
      scheduled: {
        lightTheme: "day",
        darkTheme: "night",
      },
    });

    expect(runtime.schedule?.timeZone).toBe("Asia/Kathmandu");
    expect(runtime.schedule?.latitude).toBeCloseTo(27.72);
    expect(runtime.schedule?.autoDetected).toBe(true);

    runtime.destroy();
  });
});
