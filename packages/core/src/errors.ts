import type {
  ThemeDiagnostic,
  ThemeDiagnosticCode,
  ThemeDiagnosticContext,
} from "./diagnostics";

/**
 * Options for {@link ThemeError}.
 */
export interface ThemeErrorOptions {
  /** Stable diagnostic code, when this error corresponds to one. */
  code?: ThemeDiagnosticCode;
  /** Structured context, when the error has any. */
  context?: ThemeDiagnosticContext;
  /** The underlying error, when this one wraps a failure. */
  cause?: unknown;
}

/**
 * The error type thrown by Theme Kit for theme-related failures.
 *
 * Extends the native `Error` and sets `name` to `"ThemeError"` so callers can
 * distinguish Theme Kit failures from other errors via `instanceof` or the
 * `name` property. The `message` carries the human-readable failure detail.
 *
 * When the failure corresponds to a diagnostic, the error also carries the
 * stable {@link ThemeError.code} and its structured context, so a caller can
 * branch on the code rather than matching on prose. Both are optional: the
 * single-argument form remains valid.
 *
 * @example
 * ```ts
 * const diagnostic = createDiagnostic({
 *   code: "TK_MODE_INVALID",
 *   level: "warning",
 *   message: 'setMode() received an unknown mode "purple".',
 *   context: { api: "setMode", property: "mode", received: "purple" },
 * });
 *
 * // A caller that treats this as fatal rather than recoverable:
 * throw ThemeError.fromDiagnostic(diagnostic);
 * ```
 *
 * @see {@link ThemeError.fromDiagnostic}
 */
export class ThemeError extends Error {
  /** Stable diagnostic code, or `undefined` for a plain Theme Kit failure. */
  readonly code?: ThemeDiagnosticCode;

  /** Structured context describing the failure, when available. */
  readonly context?: ThemeDiagnosticContext;

  constructor(message: string, options: ThemeErrorOptions = {}) {
    // `cause` is ES2022. Passing it through the options bag preserves the
    // original exception for `console.error` and for error-reporting tools.
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);

    this.name = "ThemeError";

    if (options.code !== undefined) this.code = options.code;
    if (options.context !== undefined) this.context = options.context;
  }

  /**
   * Build a `ThemeError` from a diagnostic.
   *
   * The diagnostic's `message` becomes the error message and its `code`,
   * `context` and `cause` are carried across, so a caller that decided a
   * diagnostic is fatal does not have to restate any of it.
   *
   * @param diagnostic - The diagnostic to convert.
   * @returns A `ThemeError` describing the same failure.
   */
  static fromDiagnostic(diagnostic: ThemeDiagnostic): ThemeError {
    return new ThemeError(diagnostic.message, {
      code: diagnostic.code,
      ...(diagnostic.context !== undefined ? { context: diagnostic.context } : {}),
      ...(diagnostic.cause !== undefined ? { cause: diagnostic.cause } : {}),
    });
  }
}
