import type { ThemeDefinition } from "../model/theme";
import { getThemeFamily, getThemeMode } from "../model";
import type { ThemeStore } from "../types";
import {
  calculateSunTimes,
  createScheduledThemeBinding,
} from "./scheduled";
import {
  resolveSolarLocation,
  type SolarLocationInput,
} from "./timezone-location";

/** Whether the schedule is driving theme selection right now. `"active"`
 *  means the schedule is enabled and applying its light/dark selection;
 *  `"disabled"` means it has been turned off (e.g. via `schedule.disable()`). */
export type ThemeScheduleStatus = "active" | "disabled";

/**
 * Describes the next automatic light/dark switch of a {@link ThemeSchedule}.
 */
export interface ThemeScheduleTransition {
  /** When the next automatic change happens. */
  at: Date;
  /** Theme that will be applied at `at`. */
  theme: string;
  /** `"activation"` → light theme at sunrise; `"deactivation"` → dark theme at
   *  sunset. */
  type: "activation" | "deactivation";
}

/** Reactive snapshot of a `ThemeSchedule`. Emitted to subscribers whenever the
 *  enabled state, applied theme or solar times change. */
export interface ThemeScheduleState {
  /** Whether the schedule is enabled. */
  enabled: boolean;
  /** Whether the schedule is enabled AND the currently applied theme is one of
   *  its scheduled light/dark themes (i.e. the schedule is actually driving
   *  the selection right now, not manually overridden). */
  active: boolean;
  /** `"active"` when enabled, `"disabled"` otherwise. */
  status: ThemeScheduleStatus;
  /** Today's sunrise (or the sunrise of the day `state` was computed for). */
  sunrise: Date | null;
  /** Today's sunset. */
  sunset: Date | null;
  /** The next automatic light/dark switch, with the theme it will apply. */
  nextTransition: ThemeScheduleTransition | null;
  /** Next time the light theme will be activated. */
  nextActivation: Date | null;
  /** Next time the dark theme will be activated. */
  nextDeactivation: Date | null;
  /** The theme applied during daytime. */
  lightTheme: string | null;
  /** The theme applied at night. */
  darkTheme: string | null;
  /** The resolved latitude used for solar calculations (from explicit
   *  coordinates, an explicit `timeZone`, or browser auto-detection). */
  latitude: number | null;
  /** The resolved longitude used for solar calculations. */
  longitude: number | null;
  /** The timezone the coordinates were resolved from, or `null` when explicit
   *  coordinates are in use (or detection wasn't possible — e.g. on the
   *  server). */
  timeZone: string | null;
  /** Whether the coordinates were resolved from a timezone (explicit
   *  `timeZone` or browser auto-detection) rather than explicit coordinates. */
  autoDetected: boolean;
}

/**
 * The default, disabled {@link ThemeScheduleState} snapshot. Used as the
 * initial state before a schedule resolves its location and themes.
 */
export const EMPTY_THEME_SCHEDULE_STATE: ThemeScheduleState = {
  enabled: false,
  active: false,
  status: "disabled",
  sunrise: null,
  sunset: null,
  nextTransition: null,
  nextActivation: null,
  nextDeactivation: null,
  lightTheme: null,
  darkTheme: null,
  latitude: null,
  longitude: null,
  timeZone: null,
  autoDetected: false,
};

/**
 * Options for {@link createThemeSchedule}.
 *
 * The schedule applies a light theme during daytime and a dark theme at
 * night, based on sunrise/sunset at a resolved location. `lightTheme` and
 * `darkTheme` are optional: when omitted they are derived from the currently
 * selected theme's family (falling back to the built-in neutral `light`/`dark`
 * themes) and re-resolved whenever the user switches theme family.
 */
export interface ThemeScheduleOptions<T extends ThemeDefinition> {
  /** Theme applied between sunrise and sunset. Optional — when omitted the
   *  schedule derives it from the currently selected theme's family (or falls
   *  back to the built-in neutral `"light"` theme), so it adapts as the user
   *  switches theme families. */
  lightTheme?: T["name"];
  /** Theme applied between sunset and sunrise. Optional — same derivation as
   *  `lightTheme`, falling back to the built-in neutral `"dark"` theme. */
  darkTheme?: T["name"];
  /** Explicit latitude. Optional — when omitted the location is resolved from
   *  `timeZone` or the visitor's browser timezone. */
  latitude?: number;
  /** Explicit longitude. Optional — see `latitude`. */
  longitude?: number;
  /** IANA timezone to resolve coordinates from when `latitude`/`longitude`
   *  are omitted (e.g. `"Asia/Kathmandu"`). Takes precedence over
   *  auto-detection. */
  timeZone?: string;
  /** Auto-detect the visitor's location from their browser timezone when no
   *  explicit coordinates/timezone are given. Default `true`.
   *  @defaultValue `true` */
  autoDetectLocation?: boolean;
  /** How often (ms) the schedule re-checks solar time. Default `60000`.
   *  @defaultValue `60000` */
  checkInterval?: number;
  /** Ignore schedule-driven applies within this many ms after a manual
   *  selection (e.g. a cross-tab sync). Default `0`.
   *  @defaultValue `0` */
  skipApplyMs?: number;
  /** Start enabled. Default `true`.
   *  @defaultValue `true` */
  enabled?: boolean;
  /** Override the NOAA solar math. Defaults to `calculateSunTimes`. */
  getTimes?: (date: Date, latitude: number, longitude: number) => { sunrise: Date; sunset: Date };
  /** Called before the schedule applies a theme. Return `false` to block the
   *  switch for this cycle. */
  onBeforeApply?: (theme: T) => boolean;
}

/**
 * Options for {@link ThemeSchedule.set}.
 *
 * Repositions the schedule (explicit coordinates take precedence over an
 * explicit `timeZone`, which takes precedence over auto-detection),
 * reconfigures its interval/skip window, and/or toggles its enabled state.
 */
export interface ThemeScheduleSetOptions extends SolarLocationInput {
  /** How often (ms) the schedule re-checks solar time. */
  checkInterval?: number;
  /** Ignore schedule-driven applies within this many ms after a manual
   *  selection. */
  skipApplyMs?: number;
  /** Whether the schedule should be enabled after the update. */
  enabled?: boolean;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** The default neutral theme names used when `lightTheme`/`darkTheme` are
 *  omitted and no family counterpart can be derived. */
export const DEFAULT_SCHEDULED_LIGHT_THEME = "light";
/** The default neutral dark theme name used when `darkTheme` is omitted and
 *  no family counterpart can be derived. */
export const DEFAULT_SCHEDULED_DARK_THEME = "dark";

/**
 * Input for resolving the scheduled light/dark theme pair.
 *
 * Both fields are optional; when omitted the pair is derived from the
 * currently selected theme's family, falling back to the neutral `light`/`dark`
 * themes.
 */
export interface ScheduledThemePairInput<T extends ThemeDefinition> {
  /** The theme applied during daytime. */
  lightTheme?: T["name"];
  /** The theme applied at night. */
  darkTheme?: T["name"];
}

/** Resolve the scheduled light/dark themes from the configured options and
 *  the currently selected theme. Priority: explicit `lightTheme`/`darkTheme`
 *  → same-family counterpart of the current theme → neutral `light`/`dark`.
 *  Shared by `createThemeSchedule` and `createScheduledPlugin`. */
export function resolveScheduledThemePair<T extends ThemeDefinition>(
  themes: readonly T[],
  options: ScheduledThemePairInput<T>,
  current?: { meta?: { family?: string } },
): { light: T | null; dark: T | null } {
  const findByName = (name: string | undefined): T | null => {
    if (name === undefined) return null;
    return themes.find((t) => t.name === name) ?? null;
  };
  const findFamilyTheme = (
    family: string | undefined,
    mode: "light" | "dark",
  ): T | null => {
    if (!family) return null;
    return (
      themes.find(
        (t) => getThemeFamily(t) === family && getThemeMode(t) === mode,
      ) ?? null
    );
  };

  const configuredLight = options.lightTheme;
  const configuredDark = options.darkTheme;
  const currentFamily = current?.meta?.family;

  if (configuredLight !== undefined && configuredDark !== undefined) {
    return {
      light: findByName(configuredLight),
      dark: findByName(configuredDark),
    };
  }

  if (configuredLight !== undefined) {
    return {
      light: findByName(configuredLight),
      dark:
        findFamilyTheme(currentFamily, "dark") ??
        findByName(DEFAULT_SCHEDULED_DARK_THEME),
    };
  }

  if (configuredDark !== undefined) {
    return {
      light:
        findFamilyTheme(currentFamily, "light") ??
        findByName(DEFAULT_SCHEDULED_LIGHT_THEME),
      dark: findByName(configuredDark),
    };
  }

  const familyLight = findFamilyTheme(currentFamily, "light");
  const familyDark = findFamilyTheme(currentFamily, "dark");
  if (familyLight && familyDark) {
    return { light: familyLight, dark: familyDark };
  }

  return {
    light: findByName(DEFAULT_SCHEDULED_LIGHT_THEME),
    dark: findByName(DEFAULT_SCHEDULED_DARK_THEME),
  };
}

/**
 * Framework-neutral sunrise/sunset scheduling controller. Wraps the core
 * `createScheduledThemeBinding` engine with an explicit on/off switch and a
 * reactive state snapshot (`sunrise`, `sunset`, `nextTransition`, ...) so
 * frameworks can expose it through their native accessors.
 *
 * `lightTheme` and `darkTheme` are optional: when omitted the schedule
 * derives them from the currently selected theme's family (e.g. current
 * `plum-dark` → scheduled `plum-light`/`plum-dark`) and falls back to the
 * built-in neutral `light`/`dark` themes, re-resolving whenever the user
 * switches theme family.
 *
 * The engine itself lives entirely in core — every framework wrapper talks to
 * this single contract.
 */
export function createThemeSchedule<T extends ThemeDefinition>(
  store: ThemeStore<T>,
  themes: readonly T[],
  options: ThemeScheduleOptions<T>,
): ThemeSchedule {
  let { light: lightTheme, dark: darkTheme } = resolveScheduledThemePair(
    themes,
    options,
    store.get(),
  );

  let latitude = options.latitude;
  let longitude = options.longitude;
  let timeZone = options.timeZone;
  let autoDetectLocation = options.autoDetectLocation;
  let checkInterval = options.checkInterval;
  let skipApplyMs = options.skipApplyMs;
  const getTimes = options.getTimes ?? calculateSunTimes;
  const onBeforeApply = options.onBeforeApply;

  let enabled = options.enabled ?? true;
  let binding: ReturnType<typeof createScheduledThemeBinding<T>> | null = null;
  let lastState: ThemeScheduleState = EMPTY_THEME_SCHEDULE_STATE;
  const listeners = new Set<(state: ThemeScheduleState) => void>();

  function resolveLocation() {
    return resolveSolarLocation({
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(timeZone !== undefined ? { timeZone } : {}),
      ...(autoDetectLocation !== undefined ? { autoDetectLocation } : {}),
    });
  }

  function getTimesFor(date: Date) {
    const resolved = resolveLocation();
    return getTimes(date, resolved.latitude, resolved.longitude);
  }

  function computeState(now: Date = new Date()): ThemeScheduleState {
    if (!lightTheme || !darkTheme) {
      return { ...EMPTY_THEME_SCHEDULE_STATE, enabled };
    }

    const resolved = resolveLocation();
    const { sunrise, sunset } = getTimesFor(now);
    const isDaytime = now >= sunrise && now < sunset;

    let nextTransition: ThemeScheduleTransition | null;
    let nextActivation: Date;
    let nextDeactivation: Date;

    if (isDaytime) {
      nextActivation = getTimesFor(addDays(sunrise, 1)).sunrise;
      nextDeactivation = sunset;
      nextTransition = {
        at: sunset,
        theme: darkTheme.name,
        type: "deactivation",
      };
    } else if (now < sunrise) {
      nextActivation = sunrise;
      nextDeactivation = sunset;
      nextTransition = {
        at: sunrise,
        theme: lightTheme.name,
        type: "activation",
      };
    } else {
      const tomorrow = getTimesFor(addDays(sunset, 1));
      nextActivation = tomorrow.sunrise;
      nextDeactivation = tomorrow.sunset;
      nextTransition = {
        at: tomorrow.sunrise,
        theme: lightTheme.name,
        type: "activation",
      };
    }

    const currentName = store.get().name;
    const active =
      enabled &&
      (currentName === lightTheme.name || currentName === darkTheme.name);

    return {
      enabled,
      active,
      status: enabled ? "active" : "disabled",
      sunrise,
      sunset,
      nextTransition,
      nextActivation,
      nextDeactivation,
      lightTheme: lightTheme.name,
      darkTheme: darkTheme.name,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      timeZone: resolved.timeZone,
      autoDetected: resolved.autoDetected,
    };
  }

  function emit() {
    const next = computeState();
    lastState = next;
    for (const listener of listeners) {
      listener(next);
    }
  }

  function ensureBinding() {
    if (!enabled || typeof window === "undefined") return;
    if (!lightTheme || !darkTheme) return;

    binding?.destroy();
    const resolved = resolveLocation();
    binding = createScheduledThemeBinding(store, {
      lightTheme,
      darkTheme,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      ...(checkInterval !== undefined ? { checkInterval } : {}),
      ...(skipApplyMs !== undefined ? { skipApplyMs } : {}),
      getTimes,
      ...(onBeforeApply ? { onBeforeApply } : {}),
    });
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    ensureBinding();
    emit();
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    binding?.destroy();
    binding = null;
    emit();
  }

  function set(opts: ThemeScheduleSetOptions) {
    // Explicit coordinates take precedence over an explicit timezone, which
    // takes precedence over auto-detection.
    if (opts.latitude !== undefined || opts.longitude !== undefined) {
      if (opts.latitude !== undefined) latitude = opts.latitude;
      if (opts.longitude !== undefined) longitude = opts.longitude;
      timeZone = undefined;
    } else if (opts.timeZone !== undefined) {
      timeZone = opts.timeZone;
      latitude = undefined;
      longitude = undefined;
    } else if (opts.autoDetectLocation === true) {
      // Re-enable auto-detection: clear any explicit coordinates/timezone so
      // the visitor's browser timezone drives the schedule again.
      latitude = undefined;
      longitude = undefined;
      timeZone = undefined;
    }
    if (opts.autoDetectLocation !== undefined && opts.autoDetectLocation !== true) {
      autoDetectLocation = false;
    }
    if (opts.checkInterval !== undefined) checkInterval = opts.checkInterval;
    if (opts.skipApplyMs !== undefined) skipApplyMs = opts.skipApplyMs;

    if (opts.enabled !== undefined) {
      enabled = opts.enabled;
      if (enabled) {
        ensureBinding();
      } else {
        binding?.destroy();
        binding = null;
      }
    } else if (enabled) {
      // Reposition/reconfigure the live binding.
      ensureBinding();
    }
    emit();
  }

  const unsubscribeStore = store.subscribe(() => {
    // Re-resolve scheduled themes: when lightTheme/darkTheme are auto-derived
    // from the current family, switching theme families should follow.
    const next = resolveScheduledThemePair(themes, options, store.get());
    if (next.light !== lightTheme || next.dark !== darkTheme) {
      lightTheme = next.light;
      darkTheme = next.dark;
      if (enabled) ensureBinding();
    }
    emit();
  });

  if (enabled) {
    ensureBinding();
  }

  lastState = computeState();

  const schedule: ThemeSchedule = {
    enable,
    disable,
    set,
    setLastSyncTime(time: number) {
      binding?.setLastSyncTime(time);
    },
    subscribe(listener: (state: ThemeScheduleState) => void): () => void {
      listeners.add(listener);
      listener(lastState);
      return () => {
        listeners.delete(listener);
      };
    },
    get enabled() {
      return lastState.enabled;
    },
    get active() {
      return lastState.active;
    },
    get status() {
      return lastState.status;
    },
    get sunrise() {
      return lastState.sunrise;
    },
    get sunset() {
      return lastState.sunset;
    },
    get nextTransition() {
      return lastState.nextTransition;
    },
    get nextActivation() {
      return lastState.nextActivation;
    },
    get nextDeactivation() {
      return lastState.nextDeactivation;
    },
    get lightTheme() {
      return lastState.lightTheme;
    },
    get darkTheme() {
      return lastState.darkTheme;
    },
    get latitude() {
      return lastState.latitude;
    },
    get longitude() {
      return lastState.longitude;
    },
    get timeZone() {
      return lastState.timeZone;
    },
    get autoDetected() {
      return lastState.autoDetected;
    },
    get state() {
      return lastState;
    },
    destroy() {
      binding?.destroy();
      binding = null;
      unsubscribeStore();
      listeners.clear();
    },
  };

  ensureBinding();

  return schedule;
}

/**
 * A framework-neutral sunrise/sunset scheduling controller.
 *
 * Exposes an explicit on/off switch and a reactive state snapshot
 * (`sunrise`, `sunset`, `nextTransition`, ...) so frameworks can surface it
 * through their native accessors. `destroy` is idempotent and releases the
 * underlying binding and store subscription.
 */
export interface ThemeSchedule {
  /** Turn the schedule on. Applies the correct light/dark theme immediately. */
  enable(): void;
  /** Turn the schedule off. Leaves the current theme untouched. */
  disable(): void;
  /** Reposition (latitude/longitude), reconfigure, or toggle enabled state. */
  set(options: ThemeScheduleSetOptions): void;
  /** Internal: push the last cross-tab sync timestamp into the engine so the
   *  `skipApplyMs` window applies to remote changes. */
  setLastSyncTime(time: number): void;

  /**
   * Subscribes to schedule state changes.
   *
   * @param listener Receives the latest state snapshot.
   * @returns An unsubscribe function. Idempotent: calling it more than once
   *   has no effect.
   */
  subscribe(listener: (state: ThemeScheduleState) => void): () => void;

  /**
   * Whether the schedule is currently enabled.
   */
  readonly enabled: boolean;

  /**
   * Whether the schedule is enabled AND the currently applied theme is one
   * of the scheduled light/dark themes.
   */
  readonly active: boolean;

  /**
   * `"active"` when enabled, `"disabled"` otherwise.
   */
  readonly status: ThemeScheduleStatus;

  /** Today's sunrise time, or `null` when unresolvable. */
  readonly sunrise: Date | null;

  /** Today's sunset time, or `null` when unresolvable. */
  readonly sunset: Date | null;

  /** The light→dark or dark→light transition time and target, or `null`
   *  while the schedule is disabled. */
  readonly nextTransition: ThemeScheduleTransition | null;

  /** The next time the scheduled theme becomes active, or `null`. */
  readonly nextActivation: Date | null;

  /** The next time the scheduled theme stops being active, or `null`. */
  readonly nextDeactivation: Date | null;

  /** The theme applied between sunrise and sunset, or `null` when not
   *  derived yet. */
  readonly lightTheme: string | null;

  /** The theme applied between sunset and sunrise, or `null` when not
   *  derived yet. */
  readonly darkTheme: string | null;

  /** The resolved latitude used for solar calculations. */
  readonly latitude: number | null;
  /** The resolved longitude used for solar calculations. */
  readonly longitude: number | null;
  /** The timezone the coordinates were resolved from, or `null` when explicit
   *  coordinates are in use. */
  readonly timeZone: string | null;
  /** Whether the coordinates were resolved from a timezone rather than
   *  explicit coordinates. */
  readonly autoDetected: boolean;
  /** The current reactive state snapshot (stable reference between changes). */
  readonly state: ThemeScheduleState;

  /**
   * Destroys the schedule, releasing the underlying binding and store
   * subscription.
   *
   * Idempotent.
   */
  destroy(): void;
}
