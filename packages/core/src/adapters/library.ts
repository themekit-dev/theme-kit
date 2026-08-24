import type { ThemeDefinition } from "../model/theme";
import type { ThemeRuntime } from "../runtime";

/**
 * How faithfully an adapter reproduces the target library's native feel.
 *
 * - `exact`      — only map what Theme Kit defines; change nothing.
 * - `native`     — behave like the library: derive missing semantic concepts
 *                  (e.g. success/warning/info) and make small feel adjustments.
 * - `aggressive` — fully emulate the library: also adjust spacing, typography,
 *                  elevation, saturation and contrast.
 */
export type AdapterStrategy = "exact" | "native" | "aggressive";

export interface AdapterPluginContext {
  strategy: AdapterStrategy;
  mode: "light" | "dark" | "system" | undefined;
}

export interface AdapterPlugin {
  id?: string;
  /** Receive the refined semantic state and return updates to it. */
  refine?(
    state: Record<string, unknown>,
    ctx: AdapterPluginContext,
  ): void | Record<string, unknown>;
  /** Receive the generated library variables and return the final set. */
  transform?(
    variables: Record<string, string>,
    ctx: AdapterPluginContext,
  ): Record<string, string>;
}

/**
 * The contract every library adapter implements. The runtime only knows this
 * interface — it never knows Bootstrap, MUI, Chakra or any other library.
 */
export interface ThemeAdapter<T extends ThemeDefinition = ThemeDefinition> {
  readonly id: string;
  supports(runtime: ThemeRuntime<T>): boolean;
  install(runtime: ThemeRuntime<T>): void;
  uninstall(): void;
}

/**
 * A successful registration returned by `AdapterRegistry.use`. Calling
 * `dispose()` removes exactly the adapter instance it was created for — but
 * only when its own reference count drops to zero. This makes composition
 * (React Strict Mode, Svelte lifecycles, nested providers) deterministic.
 */
export interface AdapterRegistration {
  readonly id: string;
  dispose(): void;
}

/**
 * The runtime-owned adapter registry. Registering an adapter installs it;
 * the runtime notifies the registry when the active theme changes.
 *
 * `use` is idempotent per adapter instance and returns an `AdapterRegistration`
 * whose `dispose()` uninstalls deterministically:
 *
 * ```ts
 * const handle = runtime.adapters.use(adapter);
 * // ... later
 * handle.dispose();
 * ```
 */
export interface AdapterRegistry<T extends ThemeDefinition = ThemeDefinition> {
  use(adapter: ThemeAdapter<T>): AdapterRegistration;
  /** Deprecated: force-uninstall all registrations for `id`. Prefer `use().dispose()`. */
  unuse(id: string): boolean;
  list(): readonly ThemeAdapter<T>[];
  destroy(): void;
}

interface AdapterEntry<T extends ThemeDefinition> {
  adapter: ThemeAdapter<T>;
  count: number;
}

export function createAdapterRegistry<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
): AdapterRegistry<T> {
  const items = new Map<string, AdapterEntry<T>>();

  // Single source of truth for all removal. Both consumer handles
  // (`dispose`) and runtime teardown (`destroy` / `unuse`) converge here, so
  // an entry can only ever transition to "removed" once — no matter how many
  // handles reference it or which path runs first.
  function release(adapter: ThemeAdapter<T>) {
    const entry = items.get(adapter.id);
    if (!entry || entry.adapter !== adapter) return;
    entry.count -= 1;
    if (entry.count > 0) return;
    items.delete(adapter.id);
    adapter.uninstall();
  }

  function removeAll() {
    for (const entry of items.values()) {
      entry.adapter.uninstall();
    }
    items.clear();
  }

  return {
    use(adapter) {
      let entry = items.get(adapter.id);

      // If a *different* adapter instance claims the same id, replace it: the
      // previous install is torn down and the new one takes over.
      if (entry && entry.adapter !== adapter) {
        entry.adapter.uninstall();
        entry.adapter = adapter;
        entry.count = 0;
        items.set(adapter.id, entry);
      }

      if (!entry) {
        entry = { adapter, count: 0 };
        items.set(adapter.id, entry);
      }

      // Idempotent: only the first registration for an id actually installs.
      if (entry.count === 0) {
        adapter.install(runtime);
      }
      entry.count += 1;

      return {
        id: adapter.id,
        dispose: () => release(adapter),
      };
    },
    unuse(id) {
      const entry = items.get(id);
      if (!entry) return false;
      release(entry.adapter);
      return true;
    },
    list() {
      return [...items.values()].map((entry) => entry.adapter);
    },
    destroy() {
      removeAll();
    },
  };
}
