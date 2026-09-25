import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { compile } from "svelte/compiler";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mount, flushSync } from "svelte";
import * as core from "@theme-kit/core";
import type { ThemeDefinition } from "@theme-kit/core";

// Count how often the overlay engine is constructed. The engine resolves its
// options once, at creation, so "the options changed" can only mean "the
// overlay was rebuilt".
vi.mock("@theme-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof core>();
  return {
    ...actual,
    createOverlayScrollbar: vi.fn(actual.createOverlayScrollbar),
  };
});

// The overlay engine schedules work on `requestAnimationFrame`, which jsdom
// does not implement.
if (!("requestAnimationFrame" in globalThis)) {
  (globalThis as Record<string, unknown>).requestAnimationFrame = (
    cb: FrameRequestCallback,
  ) => setTimeout(() => cb(Date.now()), 0) as unknown as number;
  (globalThis as Record<string, unknown>).cancelAnimationFrame = (id: number) =>
    clearTimeout(id);
}

const themes: ThemeDefinition[] = [
  {
    name: "plain-light",
    meta: { family: "plain", mode: "light" },
    tokens: { colors: { background: "#ffffff", primary: "#2563eb" } },
  },
];

const consumerSource = `<script>
  import { ThemeProvider, ThemeScrollbar } from "@theme-kit/svelte";
  let { runtime, themes } = $props();
  let thickness = $state(6);
  let autoHide = $state(true);
  export function setThickness(value) {
    thickness = value;
  }
  export function setAutoHide(value) {
    autoHide = value;
  }
</script>

<ThemeProvider {runtime} {themes}>
  <ThemeScrollbar {thickness} {autoHide} />
</ThemeProvider>
`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(__dirname, ".generated-scrollbar");

async function buildConsumer(source: string, name: string) {
  mkdirSync(generatedDir, { recursive: true });
  const { js } = compile(source, { filename: `${name}.svelte`, runes: true });
  const outFile = join(
    generatedDir,
    `${name}.${Date.now()}.${Math.random().toString(36).slice(2)}.mjs`,
  );
  writeFileSync(outFile, js.code);
  return import(outFile.replace(/\\/g, "/"));
}

async function mountConsumer(source: string, name: string) {
  const runtime = core.createThemeRuntime({
    themes,
    dom: false,
    cssVariables: false,
  } as never);
  const target = document.createElement("div");
  document.body.appendChild(target);
  const mod = await buildConsumer(source, name);
  const instance = mount(mod.default, {
    target,
    props: { themes, runtime },
  }) as {
    setThickness: (value: number) => void;
    setAutoHide: (value: boolean) => void;
  };
  return { instance };
}

const engine = () =>
  core.createOverlayScrollbar as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  engine().mockClear();
});

afterAll(() => {
  rmSync(generatedDir, { recursive: true, force: true });
});

describe("ThemeScrollbar options", () => {
  it("creates the overlay with the options it is given", async () => {
    await mountConsumer(consumerSource, "MountConsumer");
    flushSync();

    expect(engine()).toHaveBeenCalledTimes(1);
    expect(engine().mock.calls[0]![1]).toMatchObject({
      thickness: 6,
      autoHide: true,
    });
  });

  it("rebuilds the overlay when an option changes", async () => {
    const { instance } = await mountConsumer(consumerSource, "ChangeConsumer");
    flushSync();
    expect(engine()).toHaveBeenCalledTimes(1);

    instance.setThickness(14);
    flushSync();

    // The component is a runes component, so `$effect` re-runs on the changed
    // option and the overlay is rebuilt with it — no reload, no `{#key}`.
    expect(engine()).toHaveBeenCalledTimes(2);
    expect(engine().mock.calls[1]![1]).toMatchObject({
      thickness: 14,
      autoHide: true,
    });
  });

  it("rebuilds once per change, not once per unrelated update", async () => {
    const { instance } = await mountConsumer(consumerSource, "StableConsumer");
    flushSync();
    expect(engine()).toHaveBeenCalledTimes(1);

    instance.setAutoHide(false);
    flushSync();
    expect(engine()).toHaveBeenCalledTimes(2);

    // Setting the same value again is a no-op for the effect.
    instance.setAutoHide(false);
    flushSync();
    expect(engine()).toHaveBeenCalledTimes(2);
  });
});
