import type { ThemeDefinition } from "../model/theme";
import type { ThemeTokens } from "../model/tokens";
import type { ThemeSelectionState } from "../model/selection";
import type { ThemeRuntime } from "../runtime";

/**
 * Lifecycle hooks a plugin may implement to participate in the theme runtime.
 *
 * Hooks are invoked by the plugin manager in a deterministic order: creation
 * and destruction hooks run once per plugin, while change/persist/apply hooks
 * run in plugin priority order (ascending `priority`, default `10`). All hooks
 * are optional; a plugin implements only the ones it needs.
 *
 * @remarks
 * `onRuntimeCreated` may return a disposer function that is called when the
 * plugin is removed or the manager is destroyed. `onDestroy` is invoked for
 * every registered plugin when the manager is destroyed.
 */
export interface ThemePluginHooks<T extends ThemeDefinition = ThemeDefinition> {
  /** Called once when the runtime is created. May return a disposer invoked on
   *  plugin removal or manager destruction. */
  onRuntimeCreated?: (runtime: ThemeRuntime<T>) => void | (() => void);
  /** Called before the active theme changes, with the current and next theme. */
  onBeforeThemeChange?: (data: { current: T; next: T }) => void;
  /** Called after the active theme changes, with the newly active theme. */
  onAfterThemeChange?: (data: { theme: T }) => void;
  /** Called before a theme selection is persisted. */
  onBeforePersist?: (data: { selection: ThemeSelectionState }) => void;
  /** Called after a theme selection is persisted. */
  onAfterPersist?: (data: { selection: ThemeSelectionState }) => void;
  /** Called before the active theme's tokens are applied to the runtime. */
  onBeforeApply?: (data: { theme: T }) => void;
  /** Called after the active theme's tokens are applied to the runtime. */
  onAfterApply?: (data: { theme: T }) => void;
  /** Called when the plugin is removed or the manager is destroyed. */
  onDestroy?: () => void;
  /** Transforms the theme's tokens before they are applied. Must return the
   *  (possibly modified) token set. */
  transformTokens?: (tokens: ThemeTokens, context: { theme: T }) => ThemeTokens;
}

/**
 * A named, versioned unit of behavior that hooks into the theme runtime.
 *
 * A plugin combines a unique `name` with any subset of {@link ThemePluginHooks}
 * to observe or alter theme selection, persistence, application, and lifecycle.
 * Plugins are registered through a {@link PluginManager}.
 *
 * @remarks
 * `name` must be unique within a manager; registering a duplicate name is
 * ignored. `priority` orders hook execution (lower runs first, default `10`).
 */
export interface ThemePlugin<T extends ThemeDefinition = ThemeDefinition> extends ThemePluginHooks<T> {
  /** Unique plugin identifier used for registration, lookup, and removal. */
  name: string;
  /** Semantic version of the plugin. */
  version?: string;
  /** Execution order for hooks; lower values run first. Default `10`. */
  priority?: number;
}

/**
 * Registry that manages the lifecycle of {@link ThemePlugin} instances.
 *
 * The manager stores plugins by name, orders them by priority for hook
 * dispatch, and coordinates creation and destruction. It is created by
 * {@link createPluginManager}.
 *
 * @remarks
 * `use` is idempotent per name: registering an already-registered name is
 * skipped with a warning. `destroy` invokes `onDestroy` for every plugin and
 * clears the registry; after destruction the manager is empty.
 */
export interface PluginManager<T extends ThemeDefinition = ThemeDefinition> {
  /** Registers a plugin. Returns a disposer that removes it; a no-op if the
   *  name is already registered. */
  use(plugin: ThemePlugin<T>): () => void;
  /** Removes a plugin by name. Returns `true` if it was present and removed. */
  remove(name: string): boolean;
  /** Returns all registered plugins ordered by ascending priority. */
  list(): ThemePlugin<T>[];
  /** Returns the plugin with the given name, or `undefined` if absent. */
  get(name: string): ThemePlugin<T> | undefined;
  /** Invokes `onDestroy` on every plugin and clears the registry. */
  destroy(): void;
}
