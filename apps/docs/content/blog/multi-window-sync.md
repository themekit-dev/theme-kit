---
title: "Keeping every tab in sync: multi-window theming without a backend"
date: 2026-07-21
description: "How Theme Kit synchronizes theme changes across tabs and windows using BroadcastChannel, SharedWorker and StorageEvent — with a graceful cascade of fallbacks."
tags: sync, broadcastchannel, sharedworker, storageevent
---

When a user flips to dark mode in one tab, every other open tab of your app
should follow instantly — no refresh, no polling, no backend. Theme Kit ships
three transport strategies and a cascade that picks the best one available.

## The cascade

`createMultiWindowSync()` probes the environment and selects the first transport
that works:

1. **BroadcastChannel** — the modern, dedicated channel for same-origin
   messaging. Zero setup, instant delivery.
2. **SharedWorker** — a shared thread all tabs talk to. Useful when you also want
   cross-tab coordination beyond theming.
3. **StorageEvent** — the classic `localStorage` + `storage` event pair. Works
   everywhere, including older browsers.

```ts
import { createThemeRuntime, createMultiWindowSync } from "@theme-kit/core";

const runtime = createThemeRuntime({ themes });
const sync = createMultiWindowSync({
  channelName: "my-app-themes",
});

// Wire incoming selections into the runtime
sync.subscribe((selection) => {
  runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
});

// Broadcast a local change to every other tab
sync.post({ mode: "dark", family: "slate" });
```

Each selection change is broadcast to the other windows, which apply it
locally. The `createThemeSelectionBroadcast()` adapter does the same for raw
selection updates when you only care about family + mode.

## Why this matters

Theme state is *global UI state*. If one tab shows light and another shows dark,
your app feels broken. Multi-window sync turns theming into a true
single-user-interface across the whole browsing session — and it's the same
pattern the docs site's Playground demo shows with a real second tab.

## Caveats

- BroadcastChannel and SharedWorker require **secure contexts** (HTTPS or
  `localhost`).
- StorageEvent fires in *other* tabs, not the one that wrote — which is exactly
  what we want.
- Keep the channel name stable across your app; a mismatch silently disables
  sync.
