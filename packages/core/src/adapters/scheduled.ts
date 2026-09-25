import {
  resolveSolarLocation,
  type SolarLocationInput,
} from "./timezone-location";

/**
 * Options for {@link createScheduledThemeBinding}.
 *
 * The binding applies a light theme during daytime and a dark theme at night,
 * based on sunrise/sunset at a resolved location, re-checking on an interval.
 */
export interface ScheduledThemeBindingOptions<T> {
  /** Theme applied between sunrise and sunset. */
  lightTheme: T;
  /** Theme applied between sunset and sunrise. */
  darkTheme: T;
  /** Explicit latitude. Optional — when omitted the binding resolves the
   *  location from `timeZone` or the visitor's browser timezone. */
  latitude?: number;
  /** Explicit longitude. Optional — see `latitude`. */
  longitude?: number;
  /** IANA timezone to resolve coordinates from when `latitude`/`longitude`
   *  are omitted (e.g. `"Asia/Kathmandu"`). */
  timeZone?: string;
  /** Auto-detect the visitor's location from their browser timezone when no
   *  explicit coordinates/timezone are given. Default `true`.
   *  @defaultValue `true` */
  autoDetectLocation?: boolean;
  /** How often (ms) the binding re-checks solar time.
   *  @defaultValue `60000` */
  checkInterval?: number;
  /** Override the sunrise/sunset computation. Defaults to
   *  {@link calculateSunTimes}. */
  getTimes?: (date: Date, latitude: number, longitude: number) => { sunrise: Date; sunset: Date };
  /** Ignore schedule-driven applies within this many ms after a manual
   *  selection (e.g. a cross-tab sync). @defaultValue `0` */
  skipApplyMs?: number;
  /** Called before the binding applies a theme. Return `false` to block the
   *  switch for this cycle. */
  onBeforeApply?: (theme: T) => boolean;
  /** Whether the binding should apply themes and run its timer. Defaults to
   *  `true`. Toggle at runtime via the returned `setEnabled`.
   *  @defaultValue `true` */
  enabled?: boolean;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function computeEqTime(dayOfYear: number): number {
  const b = (360 / 365) * (dayOfYear - 81);
  return (
    9.87 * Math.sin(toRadians(2 * b)) -
    7.53 * Math.cos(toRadians(b)) -
    1.5 * Math.sin(toRadians(b))
  );
}

function computeSolarDec(dayOfYear: number): number {
  return 23.439 * Math.sin(toRadians((360 / 365) * (dayOfYear - 81)));
}

/** Options accepted by `calculateSunTimes` for resolving a location when
 *  `latitude`/`longitude` are omitted. */
export type CalculateSunTimesLocationOptions = SolarLocationInput;

/**
 * Compute today's sunrise and sunset using the standard NOAA solar algorithm
 * (zenith-based, corrected for the equation of time).
 *
 * `latitude` and `longitude` are optional: when omitted (or when an options
 * object is passed instead), the location is resolved from `timeZone` or the
 * visitor's browser timezone via `resolveSolarLocation`. Passing neither
 * coordinates nor a timezone means every visitor gets sunrise/sunset for their
 * own location automatically.
 *
 * ```ts
 * // Explicit coordinates (unchanged behavior).
 * calculateSunTimes(date, 48.8566, 2.3522);
 *
 * // Resolve from the visitor's timezone.
 * calculateSunTimes(date);
 *
 * // Resolve from an explicit timezone.
 * calculateSunTimes(date, { timeZone: "Asia/Kathmandu" });
 * ```
 */
export function calculateSunTimes(
  date: Date,
  ...args:
    | [latitude: number, longitude: number, options?: SolarLocationInput]
    | [options?: SolarLocationInput]
): { sunrise: Date; sunset: Date } {
  // When the first argument is an object (or there's only one argument
  // and it's undefined), treat it as the options bag.
  const first = args[0];
  if (args.length === 0 || (args.length === 1 && (first === undefined || typeof first === "object"))) {
    const opts = (first as SolarLocationInput) ?? {};
    const resolved = resolveSolarLocation(opts);
    return calculateSunTimesAt(date, resolved.latitude, resolved.longitude);
  }

  // Otherwise, positional: latitude, longitude, optional options.
  const latitude = args[0] as number;
  const longitude = args[1] as number;
  const options = args[2] as SolarLocationInput | undefined;
  const resolved = resolveSolarLocation({
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
    ...(options?.timeZone !== undefined ? { timeZone: options.timeZone } : {}),
    ...(options?.autoDetectLocation !== undefined
      ? { autoDetectLocation: options.autoDetectLocation }
      : {}),
  });
  return calculateSunTimesAt(date, resolved.latitude, resolved.longitude);
}

/** The core NOAA computation, always with concrete coordinates. */
function calculateSunTimesAt(
  date: Date,
  latitude: number,
  longitude: number,
): { sunrise: Date; sunset: Date } {
  const dayOfYear =
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        86400000,
    );

  const eqTime = computeEqTime(dayOfYear);
  const solarDec = computeSolarDec(dayOfYear);

  const zenith = 90.833;

  const cosH =
    (Math.cos(toRadians(zenith)) -
      Math.sin(toRadians(latitude)) * Math.sin(toRadians(solarDec))) /
    (Math.cos(toRadians(latitude)) * Math.cos(toRadians(solarDec)));

  const hourAngle = toDegrees(
    Math.acos(Math.max(-1, Math.min(1, cosH)))
  );

  const localMeanTimeRise = 720 - 4 * hourAngle - eqTime;
  const localMeanTimeSet = 720 + 4 * hourAngle - eqTime;

  function minutesToDate(minutes: number): Date {
    const totalMinutes = ((minutes % 1440) + 1440) % 1440;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    const secs = Math.floor((totalMinutes % 1) * 60);
    const result = new Date(date);
    result.setHours(hours, mins, secs, 0);
    return result;
  }

  return {
    sunrise: minutesToDate(localMeanTimeRise),
    sunset: minutesToDate(localMeanTimeSet),
  };
}

/**
 * Create a scheduled theme binding that applies a light theme during daytime
 * and a dark theme at night.
 *
 * The binding resolves a location (explicit coordinates, an explicit
 * `timeZone`, or browser auto-detection), computes sunrise/sunset, applies
 * the matching theme immediately, and re-checks on `checkInterval`. It can be
 * toggled at runtime via `setEnabled` and stopped via `destroy` (which is
 * idempotent and clears the timer).
 *
 * @param store The store the scheduled theme is applied to.
 * @param options The scheduled-binding configuration.
 * @returns A controller exposing `destroy`, `setLastSyncTime`, `setEnabled`,
 *   `getEnabled` and `getLocation`.
 *
 * @example
 * ```ts
 * const binding = createScheduledThemeBinding(store, {
 *   lightTheme,
 *   darkTheme,
 *   timeZone: "Asia/Kathmandu",
 * });
 * // ... later
 * binding.destroy();
 * ```
 *
 * @see {@link ScheduledThemeBindingOptions}
 */
export function createScheduledThemeBinding<T>(
  store: { get(): T; set(theme: T, options?: { force?: boolean; suppressTransition?: boolean }): void },
  options: ScheduledThemeBindingOptions<T>,
): { destroy(): void; setLastSyncTime(time: number): void; setEnabled(enabled: boolean): void; getEnabled(): boolean; getLocation(): { latitude: number; longitude: number; timeZone: string | null; autoDetected: boolean } } {
  const checkInterval = options.checkInterval ?? 60000;
  const skipApplyMs = options.skipApplyMs ?? 0;

  const getTimes =
    options.getTimes ?? calculateSunTimes;

  let location = resolveSolarLocation({
    ...(options.latitude !== undefined ? { latitude: options.latitude } : {}),
    ...(options.longitude !== undefined
      ? { longitude: options.longitude }
      : {}),
    ...(options.timeZone !== undefined ? { timeZone: options.timeZone } : {}),
    ...(options.autoDetectLocation !== undefined
      ? { autoDetectLocation: options.autoDetectLocation }
      : {}),
  });

  let timer: ReturnType<typeof setInterval> | null = null;
  let lastSyncTime = 0;
  let enabled = options.enabled ?? true;

  function isDaytime(now: Date): boolean {
    const { sunrise, sunset } = getTimes(now, location.latitude, location.longitude);
    return now >= sunrise && now < sunset;
  }

  function startTimer() {
    if (timer !== null) return;
    timer = setInterval(apply, checkInterval);
  }

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function apply() {
    if (!enabled) return;
    if (skipApplyMs > 0 && Date.now() - lastSyncTime < skipApplyMs) {
      return;
    }

    const target = isDaytime(new Date()) ? options.lightTheme : options.darkTheme;
    const current = store.get();
    if (current === target || ((current as { name?: string })?.name && (current as { name?: string })?.name === (target as { name?: string })?.name)) {
      return;
    }

    const onBeforeApply = options.onBeforeApply;
    if (onBeforeApply && !onBeforeApply(target)) {
      return;
    }

    store.set(target);
  }

  if (enabled) {
    apply();

    startTimer();
  }

  return {
    destroy() {
      stopTimer();
    },
    setLastSyncTime(time: number) {
      lastSyncTime = time;
    },
    setEnabled(next: boolean) {
      if (next === enabled) return;
      enabled = next;
      if (enabled) {
        apply();
        startTimer();
      } else {
        stopTimer();
      }
    },
    getEnabled() {
      return enabled;
    },
    getLocation() {
      return { ...location };
    },
  };
}