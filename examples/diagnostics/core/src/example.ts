import {
  createDiagnostic,
  emitDiagnostic,
  formatDiagnostic,
  isThemeMode,
  resetDiagnosticEmission,
  ThemeError,
} from "@theme-kit/core";

/**
 * A diagnostic is plain data. Building one has no side effects and touches no
 * environment, which is what lets the same value be formatted, logged, or
 * escalated without repeating the logic that produced it.
 */
const diagnostic = createDiagnostic({
  code: "TK_MODE_INVALID",
  level: "warning",
  message: 'setMode() received an unknown mode "purple".',
  context: {
    api: "setMode",
    property: "mode",
    received: "purple",
    expected: "light | dark | system",
  },
  hint: 'Pass one of "light", "dark" or "system".',
});

console.log("code:  ", diagnostic.code);
console.log("level: ", diagnostic.level);
console.log("docs:  ", diagnostic.docs);

/**
 * Formatting is the environment-specific half. In development the context, the
 * hint and the docs link are appended, because that is where they are
 * actionable. Outside development the message is emitted alone — the failure is
 * never hidden, but the surrounding detail is not shipped to end users.
 */
console.log("\n--- development ---");
console.log(formatDiagnostic(diagnostic, { dev: true }));

console.log("\n--- production ---");
console.log(formatDiagnostic(diagnostic, { dev: false }));

/**
 * Emission is deduplicated by default, keyed by code plus the context that
 * distinguishes one occurrence from another. Reactive paths call the same API
 * on every render, so without this a single mistake floods the console.
 */
console.log("\n--- emit (second call is suppressed) ---");
emitDiagnostic(diagnostic);
emitDiagnostic(diagnostic);

/** Deduplication is process-wide, so tests reset it between cases. */
resetDiagnosticEmission();
console.log("\n--- after resetDiagnosticEmission() ---");
emitDiagnostic(diagnostic);

/**
 * Validate a value that came from outside the type system — storage, a cookie,
 * a cross-tab message, an element attribute — before passing it to the runtime.
 */
console.log("\n--- isThemeMode ---");
for (const input of ["dark", "purple", "system", "light", null]) {
  console.log(`${JSON.stringify(input)} -> ${isThemeMode(input)}`);
}

/**
 * A diagnostic is recoverable by design. When a caller decides a particular
 * failure cannot be recovered from, it can escalate the same value to a thrown
 * error and keep the code and context intact.
 */
console.log("\n--- escalate to a thrown error ---");
try {
  throw ThemeError.fromDiagnostic(diagnostic);
} catch (error) {
  if (error instanceof ThemeError) {
    console.log("ThemeError.code:    ", error.code);
    console.log("ThemeError.context: ", error.context);
  }
}
