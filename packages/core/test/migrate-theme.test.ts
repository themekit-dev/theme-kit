import { describe, expect, it, beforeEach } from "vitest";
import {
  clearMigrations,
  defineTheme,
  migrateTheme,
  registerMigration,
  type MigrationStep,
} from "../src";

beforeEach(() => {
  clearMigrations();
});

describe("migrateTheme", () => {
  const testMigration: MigrationStep = {
    from: "0.0.1",
    to: "0.1",
    description: "Rename primaryColor to primary",
    remapColors: [{ from: "primaryColor", to: "primary" }],
  };

  it("skips migration when theme has no version", () => {
    const theme = defineTheme({
      name: "test",
      tokens: { colors: { background: "#ffffff" } },
    });

    const result = migrateTheme(theme);
    expect(result).toBe(theme);
  });

  it("skips migration when already at target version", () => {
    const theme = defineTheme({
      name: "test",
      meta: { version: "0.1" },
      tokens: { colors: { primary: "#3b82f6" } },
    });

    const result = migrateTheme(theme);
    expect(result).toBe(theme);
  });

  it("applies a registered migration", () => {
    registerMigration(testMigration);

    const theme = defineTheme({
      name: "test",
      meta: { version: "0.0.1" },
      tokens: {
        colors: {
          primaryColor: "#ef4444",
          background: "#ffffff",
        },
      },
    });

    const result = migrateTheme(theme);

    expect(result.meta?.version).toBe("0.1");
    expect((result.tokens?.colors as Record<string, string>).primary).toBe(
      "#ef4444",
    );
    expect(
      (result.tokens?.colors as Record<string, string>).primaryColor,
    ).toBeUndefined();
  });

  it("preserves unmapped tokens during migration", () => {
    registerMigration(testMigration);

    const theme = defineTheme({
      name: "test",
      meta: { version: "0.0.1" },
      tokens: {
        colors: {
          primaryColor: "#ef4444",
          background: "#ffffff",
          foreground: "#000000",
        },
      },
    });

    const result = migrateTheme(theme);

    expect((result.tokens?.colors as Record<string, string>).background).toBe(
      "#ffffff",
    );
    expect((result.tokens?.colors as Record<string, string>).foreground).toBe(
      "#000000",
    );
  });

  it("applies custom migrate function", () => {
    registerMigration({
      from: "0.0.1",
      to: "0.1",
      description: "Wrap colors in semantic groups",
      migrate(theme) {
        const colors = theme.tokens?.colors as Record<string, string> | undefined;
        if (!colors) return theme;

        return {
          ...theme,
          tokens: {
            ...theme.tokens,
            colors: {
              surface: {
                default: colors.background ?? "#ffffff",
              },
              text: {
                default: colors.foreground ?? "#000000",
              },
            },
          },
        };
      },
    });

    const theme = defineTheme({
      name: "test",
      meta: { version: "0.0.1" },
      tokens: {
        colors: {
          background: "#f8fafc",
          foreground: "#0f172a",
        },
      },
    });

    const result = migrateTheme(theme);

    expect(result.meta?.version).toBe("0.1");
    const colors = result.tokens?.colors as Record<string, unknown>;
    expect((colors.surface as Record<string, string>).default).toBe("#f8fafc");
    expect((colors.text as Record<string, string>).default).toBe("#0f172a");
  });
});
