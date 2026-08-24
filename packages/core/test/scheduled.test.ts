import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createThemeStore, createScheduledThemeBinding, calculateSunTimes } from "../src";

describe("calculateSunTimes", () => {
  it("returns sunrise before sunset for summer solstice in NYC", () => {
    const date = new Date("2025-06-21T12:00:00Z");
    const { sunrise, sunset } = calculateSunTimes(date, 40.7128, -74.006);

    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    expect(sunrise.getHours()).toBeGreaterThanOrEqual(4);
    expect(sunrise.getHours()).toBeLessThanOrEqual(7);
    expect(sunset.getHours()).toBeGreaterThanOrEqual(19);
    expect(sunset.getHours()).toBeLessThanOrEqual(22);
  });

  it("returns sunrise before sunset for winter solstice in NYC", () => {
    const date = new Date("2025-12-21T12:00:00Z");
    const { sunrise, sunset } = calculateSunTimes(date, 40.7128, -74.006);

    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
    expect(sunrise.getHours()).toBeGreaterThanOrEqual(6);
    expect(sunrise.getHours()).toBeLessThanOrEqual(9);
    expect(sunset.getHours()).toBeGreaterThanOrEqual(15);
    expect(sunset.getHours()).toBeLessThanOrEqual(18);
  });

  it("produces reasonable results for southern hemisphere", () => {
    const date = new Date("2025-06-21T12:00:00Z");
    const { sunrise, sunset } = calculateSunTimes(date, -33.8688, 151.2093);

    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
  });

  it("works with custom getTimes function", () => {
    vi.useFakeTimers();
    const fixedTimes = {
      sunrise: new Date("2025-06-21T06:00:00"),
      sunset: new Date("2025-06-21T18:00:00"),
    };

    const light = { name: "day" } as const;
    const dark = { name: "night" } as const;
    const store = createThemeStore({ initialTheme: light });

    vi.setSystemTime(new Date("2025-06-21T12:00:00"));

    const binding = createScheduledThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      getTimes: () => fixedTimes,
    });

    expect(store.get().name).toBe("day");

    binding.destroy();
    vi.useRealTimers();
  });
});

describe("createScheduledThemeBinding", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies light theme during daytime", () => {
    const day = new Date("2025-06-21T14:00:00");
    vi.setSystemTime(day);

    const light = { name: "day" } as const;
    const dark = { name: "night" } as const;
    const store = createThemeStore({ initialTheme: dark });

    const binding = createScheduledThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      latitude: 40.7128,
      longitude: -74.006,
      getTimes: () => ({
        sunrise: new Date("2025-06-21T05:30:00"),
        sunset: new Date("2025-06-21T20:30:00"),
      }),
    });

    expect(store.get().name).toBe("day");
    binding.destroy();
  });

  it("applies dark theme during nighttime", () => {
    const night = new Date("2025-06-21T23:00:00");
    vi.setSystemTime(night);

    const light = { name: "day" } as const;
    const dark = { name: "night" } as const;
    const store = createThemeStore({ initialTheme: light });

    const binding = createScheduledThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      latitude: 40.7128,
      longitude: -74.006,
      getTimes: () => ({
        sunrise: new Date("2025-06-21T05:30:00"),
        sunset: new Date("2025-06-21T20:30:00"),
      }),
    });

    expect(store.get().name).toBe("night");
    binding.destroy();
  });

  it("switches themes when time crosses sunset", () => {
    const day = new Date("2025-06-21T14:00:00");
    vi.setSystemTime(day);

    const light = { name: "day" } as const;
    const dark = { name: "night" } as const;
    const store = createThemeStore({ initialTheme: light });

    const binding = createScheduledThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      latitude: 40.7128,
      longitude: -74.006,
      checkInterval: 60000,
      getTimes: () => ({
        sunrise: new Date("2025-06-21T05:30:00"),
        sunset: new Date("2025-06-21T20:30:00"),
      }),
    });

    expect(store.get().name).toBe("day");

    vi.setSystemTime(new Date("2025-06-21T21:00:00"));
    vi.advanceTimersByTime(60000);

    expect(store.get().name).toBe("night");
    binding.destroy();
  });

  it("switches themes when time crosses sunrise", () => {
    const night = new Date("2025-06-21T03:00:00");
    vi.setSystemTime(night);

    const light = { name: "day" } as const;
    const dark = { name: "night" } as const;
    const store = createThemeStore({ initialTheme: dark });

    const binding = createScheduledThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      latitude: 40.7128,
      longitude: -74.006,
      checkInterval: 60000,
      getTimes: () => ({
        sunrise: new Date("2025-06-21T05:30:00"),
        sunset: new Date("2025-06-21T20:30:00"),
      }),
    });

    expect(store.get().name).toBe("night");

    vi.setSystemTime(new Date("2025-06-21T06:00:00"));
    vi.advanceTimersByTime(60000);

    expect(store.get().name).toBe("day");
    binding.destroy();
  });

  it("stops timer on destroy", () => {
    const day = new Date("2025-06-21T14:00:00");
    vi.setSystemTime(day);

    const light = { name: "day" } as const;
    const dark = { name: "night" } as const;
    const store = createThemeStore({ initialTheme: light });

    const binding = createScheduledThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      latitude: 40.7128,
      longitude: -74.006,
      checkInterval: 60000,
      getTimes: () => ({
        sunrise: new Date("2025-06-21T05:30:00"),
        sunset: new Date("2025-06-21T20:30:00"),
      }),
    });

    binding.destroy();

    vi.setSystemTime(new Date("2025-06-21T21:00:00"));
    vi.advanceTimersByTime(60000);

    expect(store.get().name).toBe("day");
  });
});
