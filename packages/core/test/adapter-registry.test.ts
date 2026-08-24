import { describe, expect, it, vi } from "vitest";
import {
  createAdapterRegistry,
  type ThemeAdapter,
  type ThemeDefinition,
  type ThemeRuntime,
} from "../src/adapters/library";

function makeAdapter(id: string, install: () => void = vi.fn()): ThemeAdapter & {
  install: ReturnType<typeof vi.fn>;
  uninstall: ReturnType<typeof vi.fn>;
} {
  const adapter: any = {
    id,
    supports: () => true,
    install,
    uninstall: vi.fn(),
  };
  return adapter;
}

function makeRuntime(): { store: { subscribe: () => () => void } } {
  return { store: { subscribe: () => () => {} } };
}

describe("createAdapterRegistry", () => {
  it("registers and lists a single adapter", () => {
    const adapter = makeAdapter("shadcn");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    registry.use(adapter);
    expect(registry.list()).toEqual([adapter]);
    expect(adapter.install).toHaveBeenCalledTimes(1);
  });

  it("is idempotent: calling use twice with the same adapter installs once", () => {
    const adapter = makeAdapter("shadcn");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    const handle = registry.use(adapter);
    registry.use(adapter);
    expect(adapter.install).toHaveBeenCalledTimes(1);
    handle.dispose();
    // one dispose leaves one registration
    expect(registry.list()).toEqual([adapter]);
    expect(adapter.uninstall).not.toHaveBeenCalled();
  });

  it("disposes deterministically: uninstalls only after the last dispose", () => {
    const adapter = makeAdapter("shadcn");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    const handleA = registry.use(adapter);
    const handleB = registry.use(adapter);

    handleA.dispose();
    expect(adapter.uninstall).not.toHaveBeenCalled();
    expect(registry.list()).toEqual([adapter]);

    handleB.dispose();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
    expect(registry.list()).toEqual([]);
  });

  it("replaces a different adapter instance with the same id", () => {
    const first = makeAdapter("shadcn");
    const second = makeAdapter("shadcn");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    registry.use(first);
    registry.use(second);

    expect(first.uninstall).toHaveBeenCalledTimes(1);
    expect(second.install).toHaveBeenCalledTimes(1);
    expect(registry.list()).toEqual([second]);
  });

  it("does not uninstall through a stale handle after replacement", () => {
    const first = makeAdapter("shadcn");
    const second = makeAdapter("shadcn");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    const handleFirst = registry.use(first);
    registry.use(second);

    handleFirst.dispose();
    expect(second.uninstall).not.toHaveBeenCalled();
    expect(registry.list()).toEqual([second]);
  });

  it("unuse force-removes all registrations for an id", () => {
    const adapter = makeAdapter("shadcn");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    registry.use(adapter);
    expect(registry.unuse("shadcn")).toBe(true);
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
    expect(registry.list()).toEqual([]);
    expect(registry.unuse("shadcn")).toBe(false);
  });

  it("destroy uninstalls every adapter", () => {
    const a = makeAdapter("a");
    const b = makeAdapter("b");
    const registry = createAdapterRegistry({} as ThemeRuntime<ThemeDefinition>);
    registry.use(a);
    registry.use(b);
    registry.destroy();
    expect(a.uninstall).toHaveBeenCalledTimes(1);
    expect(b.uninstall).toHaveBeenCalledTimes(1);
    expect(registry.list()).toEqual([]);
  });

  it("runs install with the runtime", () => {
    const runtime = makeRuntime();
    const adapter = makeAdapter("shadcn");
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    registry.use(adapter);
    expect(adapter.install).toHaveBeenCalledWith(runtime);
  });

  it("is safe when the runtime is destroyed before an outstanding handle disposes", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const handle = registry.use(adapter);

    registry.destroy();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);

    // dispose after destroy must be a safe no-op
    handle.dispose();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
  });

  it("is safe when an outstanding handle disposes before the runtime is destroyed", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const handle = registry.use(adapter);

    handle.dispose();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);

    // destroy after dispose must not uninstall the adapter a second time
    registry.destroy();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
    expect(registry.list()).toEqual([]);
  });

  it("is safe when destroy races multiple outstanding handles", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const handleA = registry.use(adapter);
    const handleB = registry.use(adapter);

    registry.destroy();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);

    handleA.dispose();
    handleB.dispose();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
  });

  it("is safe (no-op) when a handle is disposed after the registry was already destroyed", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const handle = registry.use(adapter);

    registry.destroy();
    expect(() => handle.dispose()).not.toThrow();
  });

  it("destroy then dispose is safe", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const handle = registry.use(adapter);

    registry.destroy();
    expect(() => handle.dispose()).not.toThrow();
    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
  });

  it("dispose then destroy does not double-uninstall", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const handle = registry.use(adapter);

    handle.dispose();
    registry.destroy();

    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
  });

  it("multiple handles uninstall only once", () => {
    const adapter = makeAdapter("shadcn");
    const runtime = makeRuntime();
    const registry = createAdapterRegistry(
      runtime as unknown as ThemeRuntime<ThemeDefinition>,
    );
    const first = registry.use(adapter);
    const second = registry.use(adapter);

    first.dispose();
    second.dispose();

    expect(adapter.uninstall).toHaveBeenCalledTimes(1);
  });
});