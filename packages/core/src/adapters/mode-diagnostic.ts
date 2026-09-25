import { createDiagnostic, emitDiagnostic } from "../diagnostics";

/**
 * Render a rejected mode for a message without assuming it is a string.
 *
 * `setMode` is reachable from plain JavaScript, so the rejected value is not
 * guaranteed to be a `ThemeMode` at runtime — `undefined`, `null` and objects
 * all arrive here. Quoting only strings keeps the message readable without
 * pretending the value was something it was not.
 */
export function describeMode(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : String(value);
}

/**
 * Report a mode the runtime cannot represent.
 *
 * `setMode` is reachable from plain JavaScript, from a framework binding
 * forwarding a prop, and from anything that read a mode out of storage — none
 * of which the compiler can check. Accepting an invalid mode would put an
 * unrunnable value into the selection: no theme matches, so the store silently
 * falls back to a valid theme while `getMode()` and every readout keep
 * reporting the invalid value. Callers ignore the call instead.
 *
 * This is the single emission site for `TK_MODE_INVALID`. Both `setMode`
 * boundaries share it — the selection controller and the mode controller — so
 * the two cannot drift apart on the fields the public contract covers. Only the
 * message is boundary-neutral prose; `code`, `level`, `context` and `hint` are
 * the contract, and they are identical by construction.
 *
 * @param received The value the caller passed, which may be any type.
 */
export function emitInvalidModeDiagnostic(received: unknown): void {
  emitDiagnostic(
    createDiagnostic({
      code: "TK_MODE_INVALID",
      level: "warning",
      message:
        `setMode() received an unknown mode ${describeMode(received)}; ` +
        "the mode was left unchanged.",
      context: {
        api: "setMode",
        property: "mode",
        received,
        expected: "light | dark | system",
      },
      hint:
        'Pass one of "light", "dark" or "system". A mode read from storage, ' +
        "a cookie or an element attribute should be validated before it is passed in.",
    }),
  );
}
