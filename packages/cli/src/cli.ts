import { parseArgs } from "./utils.js";
import { ExitCodes, UsageError } from "./exit-codes.js";
import { VERSION } from "./version.js";
import { cmdGenerate } from "./commands/generate.js";
import { cmdValidate } from "./commands/validate.js";
import { cmdMigrate } from "./commands/migrate.js";
import { cmdInspect } from "./commands/inspect.js";
import { cmdExport } from "./commands/export.js";

const commands = {
  generate: cmdGenerate,
  validate: cmdValidate,
  migrate: cmdMigrate,
  inspect: cmdInspect,
  export: cmdExport,
};

const commandHelp: Record<string, string> = {
  generate: `
Generate a Theme

Derives a complete light + dark pair (or a single theme) from one seed color.

Usage:
  theme-kit generate [options]

Options:
  --seed <color>       Source hex color (#rrggbb)    [default #6366f1]
  --family <name>      Family name for the theme name [default "default"]
  --mode <mode>        light | dark | both             [default both]
  --code               Also generate a tokens.code syntax palette (opt-in)
  --output <file>      Write JSON to a file instead of stdout
`,
  validate: `
Validate a Theme

Checks a theme file against the Theme Kit schema, required tokens, references,
and contrast calculations.

Usage:
  theme-kit validate <file> [options]

Options:
  --file <path>        Theme file to validate (or pass positionally)

Exit codes:
  0   theme is valid
  3   validation failed (issues are listed)
`,
  migrate: `
Migrate a Theme

Migrates a legacy theme file to the current Theme Kit format.

Usage:
  theme-kit migrate <file> [options]

Options:
  --file <path>        Legacy theme file to migrate (or pass positionally)
  --output <file>      Write the migrated theme to a file
`,
  inspect: `
Inspect a Theme

Prints a human-readable summary of a theme's meta, token groups, and references.

Usage:
  theme-kit inspect <file> [options]

Options:
  --file <path>        Theme file to inspect (or pass positionally)
`,
  export: `
Export a Theme

Exports theme tokens to CSS variables or a flat JSON map.

Usage:
  theme-kit export <file> [options]

Options:
  --file <path>        Theme file to export (or pass positionally)
  --format <fmt>       css | json                        [default css]
  --output <file>      Write the export to a file instead of stdout
`,
};

function printMainHelp() {
  console.log(`
Theme Kit CLI — v${VERSION}

The command-line toolkit for generating, validating, migrating, inspecting,
and exporting Theme Kit themes.

Usage:
  theme-kit <command> [options]

Commands:
  generate   Generate a theme from a seed color
  validate   Validate a theme
  migrate    Migrate a theme to the latest format
  inspect    Inspect a theme
  export     Export a theme to CSS or JSON

Options:
  -h, --help      Show help
  -v, --version   Show version

Run "theme-kit <command> --help" for command-specific options.
`);
}

function printCommandHelp(commandName: keyof typeof commands) {
  console.log(commandHelp[commandName] ?? printMainHelp());
}

async function main(argv: string[]) {
  const args = parseArgs(argv);

  if (args.version || args.v) {
    console.log(VERSION);
    process.exit(ExitCodes.OK);
  }

  const commandName = args._[0] as keyof typeof commands | undefined;

  if (!commandName) {
    printMainHelp();
    process.exit(args.help || args.h ? ExitCodes.OK : ExitCodes.Usage);
  }

  const command = commands[commandName];

  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    console.error(`Available commands: ${Object.keys(commands).join(", ")}`);
    process.exit(ExitCodes.Error);
  }

  if (args.help || args.h) {
    printCommandHelp(commandName);
    process.exit(ExitCodes.OK);
  }

  try {
    await command(args);
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`Usage: theme-kit ${commandName} [options]`);
      console.error(error.message);
      process.exit(ExitCodes.Usage);
    }
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(ExitCodes.Error);
  }
}

main(process.argv.slice(2));
