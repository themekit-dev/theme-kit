/**
 * Deep-copy a theme value for history and snapshot isolation.
 *
 * `structuredClone` is the fast path, but it throws a `DataCloneError` on
 * **any** Proxy — that is a spec-level restriction on the structured-clone
 * algorithm, not a quirk of one framework. Every reactive system hands us a
 * proxy (Vue's `reactive`, MobX observables, Immer drafts, Svelte runes), so
 * cloning the initial theme must not assume it received a plain object.
 *
 * Without this fallback, `createThemeRuntime` throws while it is building the
 * history controller — i.e. during app initialisation, before anything mounts —
 * and the host app renders an error page. That is how a Vue reactive
 * `useState` payload took down the Nuxt integration with a 500.
 *
 * A {@link ThemeDefinition} is plain JSON data (`name` / `meta` / `tokens`), so
 * a JSON round-trip is a faithful copy and keeps history entries isolated from
 * later mutation exactly as `structuredClone` would. Values that JSON cannot
 * represent (functions) are dropped rather than thrown on, since a theme
 * definition has no meaningful use for them.
 *
 * @param value - The theme value to copy.
 * @returns An independent deep copy.
 * @internal
 */
export function cloneThemeValue<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
