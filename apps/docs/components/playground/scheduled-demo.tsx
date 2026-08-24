"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateSunTimes,
  getBrowserTimeZone,
  getLocationForTimeZone,
  getTimeZoneList,
} from "@theme-kit/core";
import { useTheme, useThemeSchedule } from "@theme-kit/next/client";

const AUTO = "__auto__";

const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Reykjavík", lat: 64.1466, lon: -21.9426 },
];

function fmtTime(date: Date | null | undefined): string {
  if (!date) return "—:—";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayProgress(
  now: Date,
  sunrise: Date,
  sunset: Date,
): number {
  const total = sunset.getTime() - sunrise.getTime();
  const elapsed = now.getTime() - sunrise.getTime();
  return Math.min(1, Math.max(0, elapsed / total));
}

function formatCoord(value: number): string {
  const abs = Math.abs(value).toFixed(1);
  return value >= 0 ? `${abs}° N` : `${abs}° S`;
}

export function ScheduledDemo() {
  const theme = useTheme();
  const schedule = useThemeSchedule();

  const timeZones = useMemo(() => getTimeZoneList(), []);
  const [selectedZone, setSelectedZone] = useState<string>(AUTO);
  const [lat, setLat] = useState(40.7128);
  const [lon, setLon] = useState(-74.006);

  // `now` stays null on the server and during hydration so the initial HTML is
  // deterministic. It is only filled in after mount, when the real clock,
  // locale and timezone are available — otherwise the sunrise/sunset strings,
  // day/night badge and sun position would differ between server and client.
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const detectedZone = useMemo(() => {
    if (!mounted || typeof window === "undefined") return null;
    return getBrowserTimeZone();
  }, [mounted]);

  // After mount, sync the manual preview sliders to the auto-detected
  // location so the sun path and the schedule agree on first paint.
  useEffect(() => {
    if (!mounted) return;
    if (selectedZone === AUTO) {
      const zone = schedule?.state?.timeZone ?? detectedZone;
      const coords = zone ? getLocationForTimeZone(zone) : null;
      if (coords) {
        setLat(coords[0]);
        setLon(coords[1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function onTimeZoneChange(value: string) {
    setSelectedZone(value);
    if (value === AUTO) {
      schedule?.set({ autoDetectLocation: true });
      const zone = detectedZone;
      const coords = zone ? getLocationForTimeZone(zone) : null;
      if (coords) {
        setLat(coords[0]);
        setLon(coords[1]);
      }
    } else {
      schedule?.set({ timeZone: value });
      const coords = getLocationForTimeZone(value);
      if (coords) {
        setLat(coords[0]);
        setLon(coords[1]);
      }
    }
  }

  const { sunrise, sunset } = useMemo(() => {
    if (!now) return { sunrise: null, sunset: null };
    return calculateSunTimes(now, lat, lon);
  }, [now, lat, lon]);

  const isDay = mounted && now && sunrise && sunset
    ? now >= sunrise && now < sunset
    : null;
  const progress = mounted && now && sunrise && sunset
    ? dayProgress(now, sunrise, sunset)
    : 0;

  const dayArcPoints = useMemo(() => {
    const width = 260;
    const height = 90;
    const cx = width / 2;
    const cy = 70;
    const r = 66;
    const points: { x: number; y: number; hour: number }[] = [];
    for (let h = 0; h <= 24; h += 1) {
      // Simulate a sun arc: rises at sunrise, peaks at noon, sets at sunset.
      let t = 0.5;
      if (h <= 6) t = 0.1;
      else if (h >= 18) t = 0.1;
      else t = (h - 6) / 12;
      const angle = Math.PI * (1 - t);
      // Round to a fixed precision: Math.cos/Math.sin can differ in the last
      // ULP between Node's V8 and a browser's V8, which would make the path
      // `d` and label coords differ between the server HTML and the client.
      points.push({
        x: Number((cx + Math.cos(angle) * r).toFixed(2)),
        y: Number((cy - Math.sin(angle) * r * 0.9).toFixed(2)),
        hour: h,
      });
    }
    return points;
  }, []);

  const sunIndex = Math.min(24, Math.max(0, Math.round(progress * 12)));

  // The schedule state resolves per-visitor on the client (timezone
  // auto-detection), so it differs between the server render and the hydrated
  // client. Read it only after mount — same pattern as `now` above — keeping
  // the SSR HTML deterministic and hydration mismatch-free.
  const state = mounted ? schedule?.state : undefined;
  const enabled = state?.enabled ?? false;
  const scheduledIsActive = state?.active ?? false;
  const nowInDay =
    mounted && state?.sunrise && state?.sunset
      ? now! >= state.sunrise && now! < state.sunset
      : null;
  const next = state?.nextTransition ?? null;

  const activeZone = selectedZone === AUTO ? (state?.timeZone ?? detectedZone) : selectedZone;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              !enabled
                ? "bg-muted text-foreground/60"
                : scheduledIsActive
                  ? nowInDay
                    ? "bg-amber-400 text-amber-950"
                    : "bg-indigo-600 text-white"
                  : "bg-yellow-400/80 text-yellow-950"
            }`}
          >
            {!enabled
              ? "Schedule off"
              : scheduledIsActive
                ? nowInDay
                  ? "☀ Scheduled · Light"
                  : "☾ Scheduled · Dark"
                : "Scheduled · manual override"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => schedule?.enable()}
              disabled={enabled}
              className="px-3 py-1.5 rounded-lg border border-primary bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enable schedule
            </button>
            <button
              type="button"
              onClick={() => schedule?.disable()}
              disabled={!enabled}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold cursor-pointer hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Disable schedule
            </button>
          </div>

          <span className="ml-auto text-xs opacity-60">
            Applied now:{" "}
            <strong className="mono text-foreground">{theme.theme.name}</strong>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm min-w-[260px] flex-1">
            <span className="font-medium">
              Location / timezone
              {state?.autoDetected && selectedZone === AUTO && (
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                  auto-detected
                </span>
              )}
            </span>
            <select
              value={selectedZone}
              onChange={(e) => onTimeZoneChange(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value={AUTO}>
                {mounted && detectedZone
                  ? `Auto — my location (${detectedZone})`
                  : "Auto — my location"}
              </option>
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <span className="text-xs opacity-60">
              {activeZone && selectedZone !== AUTO && (
                <>
                  <code className="mono text-[0.9em]">{activeZone}</code> ·{" "}
                  {formatCoord(lat)}, {formatCoord(lon)}
                </>
              )}
            </span>
          </label>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Sunrise
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {fmtTime(state?.sunrise)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Sunset
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {fmtTime(state?.sunset)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Next transition
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {next ? `${fmtTime(next.at)} → ${next.theme}` : "—:—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Scheduled themes
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {state?.lightTheme} / {state?.darkTheme}
              </div>
            </div>
          </div>
        </div>

        <p className="m-0 mt-3 text-xs opacity-60 leading-relaxed">
          This runs the real{" "}
          <code className="mono text-[0.9em]">useThemeSchedule()</code>{" "}
          controller against the site runtime, switching the whole page between{" "}
          <code className="mono text-[0.9em]">
            {state?.lightTheme ?? "light"}
          </code>{" "}
          and{" "}
          <code className="mono text-[0.9em]">{state?.darkTheme ?? "dark"}</code>{" "}
          at sunrise/sunset. With{" "}
          <strong>Auto</strong> selected, your own timezone is detected — no
          coordinates needed, anywhere in the world. Pick a timezone below to
          reposition the schedule, or drag the lat/lon sliders for a manual
          preview.
          {enabled && (
            <>
              {" "}
              Pick any other theme in the switcher while it&apos;s on — the
              schedule re-applies its light/dark theme on the next check, and
              the badge flips to &quot;manual override&quot;.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => {
              setSelectedZone(AUTO);
              setLat(city.lat);
              setLon(city.lon);
            }}
            className={`px-2.5 py-1 rounded-full border text-xs cursor-pointer transition-colors ${
              Math.abs(lat - city.lat) < 0.5 && Math.abs(lon - city.lon) < 0.5
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-center">
        <div className="flex flex-col gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="flex items-center justify-between">
              <span className="font-medium">Latitude</span>
              <span className="mono text-xs opacity-60">
                {formatCoord(lat)}
              </span>
            </span>
            <input
              type="range"
              min={-90}
              max={90}
              step={0.1}
              value={lat}
              onChange={(e) => {
                setSelectedZone(AUTO);
                setLat(Number(e.target.value));
              }}
              className="accent-[var(--theme-color-primary)] w-full cursor-pointer"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="flex items-center justify-between">
              <span className="font-medium">Longitude</span>
              <span className="mono text-xs opacity-60">
                {formatCoord(lon)}
              </span>
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              step={0.1}
              value={lon}
              onChange={(e) => {
                setSelectedZone(AUTO);
                setLon(Number(e.target.value));
              }}
              className="accent-[var(--theme-color-primary)] w-full cursor-pointer"
            />
          </label>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Sunrise
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {sunrise ? fmtTime(sunrise) : "—:—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Now
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {now ? fmtTime(now) : "—:—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">
                Sunset
              </div>
              <div className="mono text-sm font-semibold mt-0.5">
                {sunset ? fmtTime(sunset) : "—:—"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-50 mb-2">
            Sun path today
          </div>
          <svg
            viewBox="0 0 260 90"
            className="w-full max-w-[260px] mx-auto"
            role="img"
            aria-label="Sun path visualization"
          >
            <line
              x1="0"
              y1="70"
              x2="260"
              y2="70"
              stroke="var(--theme-color-border)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {[0, 6, 12, 18, 24].map((h) => {
              const pt = dayArcPoints[h]!;
              return (
                <text
                  key={h}
                  x={pt.x}
                  y={86}
                  textAnchor="middle"
                  fontSize="8"
                  opacity="0.4"
                  fill="currentColor"
                >
                  {h}
                </text>
              );
            })}
            <path
              d={dayArcPoints
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ")}
              fill="none"
              stroke="var(--theme-color-primary)"
              strokeWidth="2"
              opacity="0.5"
              strokeLinecap="round"
            />
            {mounted && (
              <circle
                cx={dayArcPoints[sunIndex]!.x}
                cy={dayArcPoints[sunIndex]!.y}
                r="7"
                fill={isDay ? "#fbbf24" : "#818cf8"}
                stroke="var(--theme-color-background)"
                strokeWidth="2"
              />
            )}
          </svg>
          <div className="text-[11px] opacity-50 mt-1 text-center">
            Sun position now — pick a timezone above or drag the sliders to
            move around the world.
          </div>
        </div>
      </div>

      <p className="m-0 text-sm opacity-70 leading-relaxed">
        Theme Kit computes NOAA-style solar times via{" "}
        <code className="mono text-[0.9em]">calculateSunTimes(date, lat, lon)</code>{" "}
        — with no coordinates it auto-detects the visitor&apos;s timezone — and
        can auto-switch between light and dark at sunrise/sunset with the{" "}
        <code className="mono text-[0.9em]">scheduled</code> runtime option.
        Current site mode: <strong className="mono">{theme.mode}</strong>.
      </p>
    </div>
  );
}
