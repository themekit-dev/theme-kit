/**
 * Portable environment resolution shared by the docs browser probes
 * (`apps/docs/scripts/probe-*.mjs`).
 *
 * The probes drive `next dev` with a real Chromium through `playwright-core`.
 * Playwright lives with the example verification harness rather than in this
 * app, so it is resolved from there instead of being added as a dependency here.
 *
 * Nothing in this module may hardcode a machine path or depend on an environment
 * variable that only exists on one host:
 *
 *   - Chromium comes from Playwright's own installation (`CHROME_PATH` wins).
 *   - The interpreter is the Node already running the probe (`PROBE_NODE` wins).
 *   - The port is per-probe, overridable with `PROBE_PORT`.
 *
 * The probes are manual/CI-optional checks, not part of `docs:release-gate`:
 * they need a Chromium download and a live `next dev`.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/** `playwright-core`, resolved from the example verification harness. */
const toolsRequire = createRequire(
  path.join(here, "../../../../examples/apps/_tools/"),
);

export const { chromium } = toolsRequire("playwright-core");

/** The Chromium to drive: `CHROME_PATH` wins, else Playwright's own install. */
export const CHROME = process.env.CHROME_PATH ?? chromium.executablePath();

/** The Node running this probe — never a hardcoded interpreter path. */
export const NODE = process.env.PROBE_NODE ?? process.execPath;

/**
 * The port this probe's dev server should listen on.
 *
 * @param fallback - the probe's own default, used when `PROBE_PORT` is unset.
 */
export function probePort(fallback) {
  const raw = Number(process.env.PROBE_PORT ?? fallback);
  if (!Number.isInteger(raw) || raw <= 0 || raw > 65535) {
    throw new Error(`PROBE_PORT must be a valid TCP port, got "${process.env.PROBE_PORT}"`);
  }
  return raw;
}

/** The docs app directory (`apps/docs`) — the probes' `next` working directory. */
export const docsDir = path.join(here, "..", "..");
