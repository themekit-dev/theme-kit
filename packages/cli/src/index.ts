/**
 * Theme Kit CLI — programmatic entry points.
 *
 * Exposes the same commands as the `theme-kit` binary (`generate`,
 * `validate`, `migrate`, `inspect`, `export`) plus `parseArgs`,
 * `UsageError`, and `ExitCodes` for embedding or scripting.
 *
 * @packageDocumentation
 */
export { cmdGenerate } from "./commands/generate.js";
export { cmdValidate } from "./commands/validate.js";
export { cmdMigrate } from "./commands/migrate.js";
export { cmdInspect } from "./commands/inspect.js";
export { cmdExport } from "./commands/export.js";
export { ExitCodes, UsageError } from "./exit-codes.js";
export { parseArgs } from "./utils.js";
export type { ParsedArgs } from "./utils.js";
export { VERSION } from "./version.js";
