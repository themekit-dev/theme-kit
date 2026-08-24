---
title: "Persistence and multi-window sync, explained"
date: 2026-08-18
description: "How Theme Kit remembers the user's choice across reloads and keeps every tab in sync — persistence adapters, BroadcastChannel, SharedWorker, and the StorageEvent fallback."
tags: persistence, sync, adapters
---

Two things make theming feel like it's actually "saved": the theme survives a reload, and it stays consistent across tabs. Both are harder than they look — and both are solved by small, replaceable adapters in Theme Kit.

## Persistence: the selection outlives the page

The runtime persists the *selection* — `{ mode, family }` — not the theme definition:

```ts
import { createThemeRuntime, createPersistencePlugin } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  plugins: [createPersistencePlugin()],
  // writes { mode, family } to localStorage under "theme-selection"
});
```

On the next load, the runtime reads the saved selection and resolves the theme before first paint. The default persistence adapter is a thin wrapper over `localStorage` with a `storage` event subscription, so the docs site itself survives a hard refresh with your exact family and mode.

### Custom keys and storage

Pass `key` to avoid collisions when multiple apps share an origin, or swap the underlying storage:

```ts
createPersistencePlugin({ key: "my-app-theme" });
```

Because persistence is an adapter (`get`/`set`/`remove`/`subscribe`), you can back it with `sessionStorage`, cookies, IndexedDB, or a server round-trip — the runtime doesn't care.

## Multi-window sync: every tab follows

Two tabs each run their own runtime. When tab A flips to dark, tab B should too. Theme Kit ships `createMultiWindowSync()`, which picks the best available transport:

```ts
import { createMultiWindowSync } from "@theme-kit/core";

const sync = createMultiWindowSync({ prefer: "auto" });

sync.subscribe((selection) => {
  runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
});

sync.post({ mode: "dark", family: "slate" });
```

The transport cascade is:

1. **BroadcastChannel** — the modern same-origin channel. Instant, zero storage writes.
2. **SharedWorker** — a shared thread every tab talks to; useful when you also coordinate beyond theming.
3. **StorageEvent** — the classic `localStorage` + `storage` event pair; works in every browser that supports localStorage.

### Pairing persistence and sync

They solve different problems and work together:

- **Persistence** survives reloads — it writes the selection to storage and reads it at bootstrap.
- **Sync** propagates changes *while the app is running* — other open tabs update instantly.

A theme change in one tab is written to storage (persistence) and broadcast to other tabs (sync) in the same tick. A tab that opens later reads the persisted selection; tabs that were already open get the live update.

## Replaceable by design

Both adapters implement tiny interfaces, so they're drop-in replaceable:

- `ThemeSelectionPersistenceAdapter` — `get/set/remove/subscribe` over `{ mode, family }`
- `ThemeSelectionBroadcastAdapter` — `post/subscribe/destroy` over the same selection shape

Roll your own (a server-backed persistence adapter, an iFrame messaging sync) and pass it straight to the runtime options `persistence` and `broadcast`. The rest of the library — transitions, SSR bootstrap, scoped themes — composes on top without knowing which adapters you chose.

Try it on this site: open the docs in two tabs, switch families in one, and watch the other follow instantly.