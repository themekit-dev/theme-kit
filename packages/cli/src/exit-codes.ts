/**
 * Stable process exit codes for the `theme-kit` CLI.
 *
 * These are guaranteed by the command implementations and documented in the
 * CLI README and docs. Consumers (CI pipelines, editor integrations) can rely
 * on them without parsing stdout.
 */
export const ExitCodes = Object.freeze({
  /** Command completed successfully. */
  OK: 0,
  /** A runtime or command error occurred. */
  Error: 1,
  /** Invalid arguments / usage error. */
  Usage: 2,
  /** A theme failed validation (the `validate` command). */
  ValidationFailed: 3,
});

/**
 * Thrown by commands when the user passes invalid arguments. Reported by the
 * CLI runtime with exit code `Usage` (2) and a usage hint.
 */
export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}