import type { ThemeMode } from "./model/theme";

/**
 * Severity of a Theme Kit diagnostic.
 *
 * The level is a deliberate decision per diagnostic, not a default. It records
 * what the caller is expected to do about it:
 *
 * - `"error"` — continuing would produce incorrect state.
 * - `"warning"` — recoverable, but the caller very likely made a mistake.
 * - `"deprecation"` — still supported, but scheduled to be removed.
 * - `"info"` — useful context; never indicates a problem.
 *
 * @see {@link ThemeDiagnostic}
 */
export type ThemeDiagnosticLevel = "error" | "warning" | "deprecation" | "info";

/**
 * A stable, machine-readable identifier for a Theme Kit diagnostic.
 *
 * Codes are part of the public contract: they are what tests assert on and what
 * tooling can filter by. The human-readable message is deliberately *not* — it
 * may be reworded at any time.
 *
 * Naming is `TK_<DOMAIN>_<CONDITION>`. Codes are added only alongside the
 * diagnostic that actually emits them; this union is never pre-populated with
 * speculative entries.
 *
 * @see {@link ThemeDiagnostic}
 */
export type ThemeDiagnosticCode =
  /** A `ThemeMode` value that is not `"light"`, `"dark"` or `"system"`. */
  | "TK_MODE_INVALID"
  /** A theme definition is missing a required semantic token. */
  | "TK_THEME_TOKEN_MISSING"
  /** A foreground/background pair fails its contrast requirement. */
  | "TK_A11Y_CONTRAST_VIOLATION"
  /** A schedule was configured but its light/dark themes could not be resolved. */
  | "TK_SCHEDULE_THEME_UNRESOLVED"
  /** A plugin's `onDestroy` hook threw while the manager was tearing down. */
  | "TK_PLUGIN_DESTROY_FAILED";

/**
 * Structured, machine-readable context for a diagnostic.
 *
 * Every field is optional because a diagnostic should carry only what it
 * actually knows. The point of the structure is that a caller can act on the
 * failure without parsing prose.
 *
 * @see {@link ThemeDiagnostic}
 */
export interface ThemeDiagnosticContext {
  /** The public API involved, e.g. `"setMode"`. */
  api?: string;
  /** The property or argument at fault, e.g. `"mode"`. */
  property?: string;
  /** A path into the offending input, e.g. `"colors.primary"`. */
  path?: string;
  /** The value that was received. Omitted when it cannot be serialised usefully. */
  received?: unknown;
  /** The value(s) that were expected, as a human-readable description. */
  expected?: string;
  /**
   * Extra structured payload the diagnostic carries.
   *
   * Used when the evidence is more than a single offending value — a list of
   * failing checks, for example. It is emitted as part of the diagnostic object
   * so the detail is available without being flattened into prose.
   */
  details?: unknown;
}

/**
 * A single Theme Kit diagnostic.
 *
 * This is plain data: creating one has no side effects and touches no
 * environment. Emission and formatting are separate concerns — see
 * {@link formatDiagnostic} and {@link emitDiagnostic} — so the same diagnostic
 * can be collected, thrown, logged, or forwarded to a DevTools layer without
 * duplicating the logic that produced it.
 *
 * @see {@link createDiagnostic}
 * @see {@link ThemeDiagnosticCode}
 */
export interface ThemeDiagnostic {
  /** Stable identifier. Safe to assert on in tests and to filter by. */
  code: ThemeDiagnosticCode;
  /** How serious this is, and what the caller should do about it. */
  level: ThemeDiagnosticLevel;
  /** A concise, actionable description of what is wrong. */
  message: string;
  /** Structured context, when the diagnostic has any. */
  context?: ThemeDiagnosticContext;
  /** What to do instead. Present only when there is a concrete correction. */
  hint?: string;
  /** Link to the reference entry for this code. Derived from {@link code}. */
  docs?: string;
  /** The underlying error, when this diagnostic reports a failure. */
  cause?: unknown;
}

/**
 * Input accepted by {@link createDiagnostic}.
 *
 * `code`, `level` and `message` are required; everything else is optional so a
 * diagnostic carries only what it knows.
 */
export interface CreateDiagnosticInput {
  /** Stable identifier for this diagnostic. */
  code: ThemeDiagnosticCode;
  /** Severity, chosen deliberately rather than defaulted. */
  level: ThemeDiagnosticLevel;
  /** Concise, actionable description of what is wrong. */
  message: string;
  /** Structured context, when available. */
  context?: ThemeDiagnosticContext;
  /** What to do instead. */
  hint?: string;
  /** The underlying error, when this reports a failure. */
  cause?: unknown;
}

/**
 * Base URL for the diagnostic reference. Kept in one place so a code's link is
 * derived rather than repeated at every call site.
 *
 * This mirrors `apps/docs/lib/site.ts` (`SITE_URL`) and the `homepage` field
 * every package.json already declares. When the project moves to its own
 * domain, this value has to move with them.
 */
const DOCS_BASE = "https://theme-kit-dev.vercel.app/reference/diagnostics";

/**
 * Create a {@link ThemeDiagnostic}.
 *
 * Pure: no console access, no environment reads, no deduplication. The `docs`
 * link is derived from the code so call sites never repeat it.
 *
 * @param input - The diagnostic fields.
 * @returns A diagnostic value. Creating one has no side effects.
 *
 * @example
 * ```ts
 * const diagnostic = createDiagnostic({
 *   code: "TK_MODE_INVALID",
 *   level: "warning",
 *   message: 'setMode() received an unknown mode "purple".',
 *   context: { api: "setMode", property: "mode", received: "purple", expected: "light | dark | system" },
 *   hint: "Pass one of the three valid modes, or omit the call.",
 * });
 * ```
 *
 * @see {@link emitDiagnostic}
 */
export function createDiagnostic(input: CreateDiagnosticInput): ThemeDiagnostic {
  const diagnostic: ThemeDiagnostic = {
    code: input.code,
    level: input.level,
    message: input.message,
    docs: `${DOCS_BASE}#${input.code.toLowerCase()}`,
  };

  if (input.context !== undefined) diagnostic.context = input.context;
  if (input.hint !== undefined) diagnostic.hint = input.hint;
  if (input.cause !== undefined) diagnostic.cause = input.cause;

  return diagnostic;
}

/**
 * Render a diagnostic as a single log line.
 *
 * This is the environment-specific half of the model: the diagnostic itself is
 * plain data, and this decides how much of it a given environment should see.
 * In development the context, hint and docs link are appended, because that is
 * where they are actionable. Outside development the message is emitted alone —
 * the failure is never hidden, but the surrounding detail is not shipped to end
 * users.
 *
 * @param diagnostic - The diagnostic to render.
 * @param options - `dev` overrides environment detection. Intended for tests and
 *   for callers that already know which build they are in.
 * @returns A single-line, prefixed string.
 *
 * @see {@link emitDiagnostic}
 */
export function formatDiagnostic(
  diagnostic: ThemeDiagnostic,
  options: { dev?: boolean } = {},
): string {
  const dev = options.dev ?? isDevelopment();
  let text = `[theme-kit] ${diagnostic.message} (${diagnostic.code})`;

  if (!dev) return text;

  const parts: string[] = [];
  const context = diagnostic.context;

  if (context?.api) parts.push(`api: ${context.api}`);
  if (context?.property) parts.push(`property: ${context.property}`);
  if (context?.path) parts.push(`path: ${context.path}`);
  if (context?.received !== undefined) parts.push(`received: ${safeString(context.received)}`);
  if (context?.expected !== undefined) parts.push(`expected: ${context.expected}`);

  if (parts.length > 0) text += `\n  ${parts.join("\n  ")}`;
  if (diagnostic.hint) text += `\n  hint: ${diagnostic.hint}`;
  if (diagnostic.docs) text += `\n  docs: ${diagnostic.docs}`;

  return text;
}

/**
 * Whether to emit the richer development form of a diagnostic.
 *
 * `process` is absent in a browser bundle, so the access is guarded and the
 * identifier is only read when it exists — this keeps the check from throwing
 * in a browser and lets a bundler statically replace
 * `process.env.NODE_ENV`. When there is no signal at all (a browser bundle with
 * no replacement, or an unset variable) this reports development, because
 * suppressing a correctness failure is worse than an extra line of context.
 *
 * @returns `true` when the richer form should be emitted.
 */
function isDevelopment(): boolean {
  const env =
    typeof process !== "undefined" ? process.env?.NODE_ENV : undefined;

  if (env === "production") return false;
  return true;
}

/** Render an unknown value for a log line without throwing on cycles. */
function safeString(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);

  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
}

/** A destination for rendered diagnostics. */
export type DiagnosticSink = (text: string, diagnostic: ThemeDiagnostic) => void;

/**
 * Options for {@link emitDiagnostic}.
 */
export interface EmitDiagnosticOptions {
  /** Override environment detection. */
  dev?: boolean;
  /**
   * Whether to suppress a diagnostic already emitted with the same code and
   * context. Default `true`.
   *
   * Reactive paths call the same API on every render or every store update, so
   * without this a single mistake floods the console. The first occurrence is
   * the informative one.
   */
  dedupe?: boolean;
  /** Where to write. Defaults to the matching `console` method for the level. */
  sink?: DiagnosticSink;
}

/** Codes and contexts already emitted, so reactive paths cannot flood the console. */
const emitted = new Set<string>();

/**
 * Route a diagnostic to the console method that matches its level.
 *
 * The structured diagnostic is passed as a second argument so the detail is
 * inspectable in a devtools console — the same reason the accessibility plugin
 * used to pass its failing checks alongside the message.
 */
function defaultSink(diagnostic: ThemeDiagnostic): DiagnosticSink {
  return (text) => {
    if (diagnostic.level === "error") {
      console.error(text, diagnostic);
      return;
    }

    if (diagnostic.level === "info") {
      console.info(text, diagnostic);
      return;
    }

    console.warn(text, diagnostic);
  };
}

/**
 * Emit a diagnostic to the console.
 *
 * Developer-facing Theme Kit diagnostics go through here rather than calling
 * `console` directly, so that the level, the code, the deduplication and the
 * development/production formatting stay consistent across packages.
 *
 * Repeated identical diagnostics are suppressed by default; see
 * {@link EmitDiagnosticOptions.dedupe}. Use {@link resetDiagnosticEmission} to
 * clear that memory.
 *
 * @param diagnostic - The diagnostic to emit.
 * @param options - Environment, deduplication and sink overrides.
 *
 * @see {@link createDiagnostic}
 * @see {@link formatDiagnostic}
 */
export function emitDiagnostic(
  diagnostic: ThemeDiagnostic,
  options: EmitDiagnosticOptions = {},
): void {
  const dedupe = options.dedupe ?? true;
  const key = diagnosticKey(diagnostic);

  if (dedupe && emitted.has(key)) return;
  emitted.add(key);

  const text = formatDiagnostic(diagnostic, {
    ...(options.dev !== undefined ? { dev: options.dev } : {}),
  });

  (options.sink ?? defaultSink(diagnostic))(text, diagnostic);
}

/**
 * Build the deduplication key for a diagnostic: its code plus the context that
 * distinguishes one occurrence from another. Two calls with the same code and
 * the same offending value are the same mistake.
 */
function diagnosticKey(diagnostic: ThemeDiagnostic): string {
  const c = diagnostic.context;
  return [
    diagnostic.code,
    c?.api ?? "",
    c?.property ?? "",
    c?.path ?? "",
    c?.received === undefined ? "" : safeString(c.received),
  ].join("|");
}

/**
 * Forget which diagnostics have already been emitted.
 *
 * Deduplication is process-wide by design, which makes it stateful across
 * tests. Call this between test cases so each one observes its own emissions.
 *
 * @example
 * ```ts
 * beforeEach(() => resetDiagnosticEmission());
 * ```
 */
export function resetDiagnosticEmission(): void {
  emitted.clear();
}

/**
 * Narrow an unknown value to a {@link ThemeMode}.
 *
 * This is the single shared predicate for the light/dark/system axis. It is
 * exported so that adapters which receive a mode from outside the type system —
 * storage, cookies, cross-tab messages, element attributes — validate it the
 * same way instead of each re-implementing the comparison.
 *
 * @param value - The value to test.
 * @returns `true` when `value` is a valid mode.
 *
 * @example
 * ```ts
 * if (!isThemeMode(input)) {
 *   emitDiagnostic(createDiagnostic({ code: "TK_MODE_INVALID", level: "warning", message: "..." }));
 * }
 * ```
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}
