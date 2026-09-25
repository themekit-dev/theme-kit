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

/**
 * The context passed to an adapter plugin's hooks. Describes how faithfully
 * the adapter should reproduce the target library's native feel and the
 * current theme mode.
 */
export interface AdapterPluginContext {
  /** How faithfully the adapter reproduces the target library's native feel. */
  strategy: AdapterStrategy;
  /** The current theme mode, or `undefined` when no mode is resolved. */
  mode: "light" | "dark" | "system" | undefined;
}

/**
 * A plugin that refines or transforms the output of a library adapter.
 *
 * `refine` receives the refined semantic state and may return updates to it;
 * `transform` receives the generated library variables and must return the
 * final set. Both hooks are optional.
 */
export interface AdapterPlugin {
  /** Optional identifier for the plugin. */
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
  /**
   * Stable identifier used for reference counting and deduplication.
   */
  readonly id: string;

  /**
   * Whether this adapter applies to the given runtime.
   *
   * @param runtime The runtime to evaluate.
   */
  supports(runtime: ThemeRuntime<T>): boolean;

  /**
   * Installs the adapter into the runtime.
   *
   * Called by the registry on the first registration of the adapter id.
   *
   * @param runtime The runtime to install into.
   */
  install(runtime: ThemeRuntime<T>): void;

  /**
   * Removes the adapter from its runtime.
   *
   * Called when the last registration for the adapter id is disposed or the
   * registry is destroyed.
   */
  uninstall(): void;
}

/**
 * A successful registration returned by `AdapterRegistry.use`. Calling
 * `dispose()` removes exactly the adapter instance it was created for — but
 * only when its own reference count drops to zero. This makes composition
 * (React Strict Mode, Svelte lifecycles, nested providers) deterministic.
 *
 * @see {@link AdapterRegistry}
 */
export interface AdapterRegistration {
  /** The registered adapter's id. */
  readonly id: string;

  /**
   * Unregisters the adapter this registration was created for.
   *
   * Deterministic and idempotent: calling it more than once has no effect.
   * If the registry was already destroyed, this is a no-op.
   */
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
 *
 * @see {@link ThemeAdapter}
 */
export interface AdapterRegistry<T extends ThemeDefinition = ThemeDefinition> {
  /**
   * Registers an adapter with the runtime.
   *
   * The returned disposer is deterministic and idempotent. Calling it more
   * than once has no effect. If the runtime is destroyed before the disposer
   * is called, the adapter is already uninstalled and the disposer becomes a
   * no-op.
   *
   * @param adapter Adapter to register.
   * @returns A deterministic, idempotent disposer.
   */
  use(adapter: ThemeAdapter<T>): AdapterRegistration;
  /** Deprecated: force-uninstall all registrations for `id`. Prefer `use().dispose()`. */
  unuse(id: string): boolean;

  /**
   * Lists the currently registered adapters.
   */
  list(): readonly ThemeAdapter<T>[];

  /**
   * Uninstalls and forgets every registered adapter.
   *
   * Idempotent.
   */
  destroy(): void;
}

interface AdapterEntry<T extends ThemeDefinition> {
  adapter: ThemeAdapter<T>;
  count: number;
}

/**
 * Create the runtime-owned adapter registry for a theme runtime.
 *
 * Registering an adapter installs it; the registry tracks reference counts so
 * composition (React Strict Mode, Svelte lifecycles, nested providers) is
 * deterministic. `use` is idempotent per adapter instance and returns an
 * `AdapterRegistration` whose `dispose()` uninstalls exactly that instance
 * when its own reference count drops to zero. Registering a different adapter
 * instance under an already-used id replaces the previous one.
 *
 * @param runtime The theme runtime the adapters are installed into.
 * @returns The adapter registry bound to `runtime`.
 *
 * @example
 * ```ts
 * const registry = createAdapterRegistry(runtime);
 * const handle = registry.use(adapter);
 * // ... later
 * handle.dispose();
 * ```
 */
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
