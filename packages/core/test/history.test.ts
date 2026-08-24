import { describe, expect, it } from "vitest";
import { createThemeStore, createThemeHistory, defineTheme } from "../src";

const light = defineTheme({
  name: "light",
  meta: { family: "default", mode: "light" },
  tokens: { colors: { background: "#fff" } },
});

const dark = defineTheme({
  name: "dark",
  meta: { family: "default", mode: "dark" },
  tokens: { colors: { background: "#000" } },
});

describe("createThemeHistory", () => {
  it("starts with no undo/redo", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store);

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    history.destroy();
  });

  it("enables undo after a change", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store);

    store.set(dark);

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.destroy();
  });

  it("undo restores previous theme", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store);

    store.set(dark);
    expect(store.get().name).toBe("dark");

    history.undo();
    expect(store.get().name).toBe("light");

    history.destroy();
  });

  it("redo restores undone theme", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store);

    store.set(dark);
    history.undo();
    expect(store.get().name).toBe("light");

    history.redo();
    expect(store.get().name).toBe("dark");

    history.destroy();
  });

  it("clears redo stack on new change after undo", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store);

    store.set(dark);
    history.undo();
    expect(history.canRedo()).toBe(true);

    store.set(dark);
    expect(history.canRedo()).toBe(false);

    history.destroy();
  });

  it("clear resets history", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store);

    store.set(dark);
    expect(history.canUndo()).toBe(true);

    history.clear();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    history.destroy();
  });

  it("respects maxSteps option", () => {
    const store = createThemeStore({ initialTheme: light });
    const history = createThemeHistory(store, { maxSteps: 3 });

    const themeC = defineTheme({
      name: "c",
      meta: { family: "default", mode: "light" },
    });
    const themeD = defineTheme({
      name: "d",
      meta: { family: "default", mode: "light" },
    });

    store.set(dark);
    store.set(themeC);
    store.set(themeD);

    history.undo();
    expect(store.get().name).toBe("c");

    history.undo();
    expect(store.get().name).toBe("dark");

    history.undo();
    expect(store.get().name).toBe("light");

    expect(history.canUndo()).toBe(false);

    history.destroy();
  });
});
