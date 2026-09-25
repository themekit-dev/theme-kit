import { createMultiWindowSync } from "@theme-kit/core";

/**
 * `createMultiWindowSync` builds the adapter that mirrors the theme selection
 * across tabs and windows. The runtime installs one by default; passing one
 * explicitly lets you choose the strategy and observe fallbacks.
 */
const sync = createMultiWindowSync({
  channelName: "my-app-theme",
  prefer: "broadcast",
  onFallback: (strategy) => console.warn("sync fell back to:", strategy),
});

console.log(
  "adapter ready:",
  typeof sync.post === "function" &&
    typeof sync.subscribe === "function" &&
    typeof sync.destroy === "function",
);

const unsubscribe = sync.subscribe((selection) => {
  console.log("received from another window:", selection);
});

// The runtime calls `post()` on every selection change. It reaches *other*
// windows, not this one — hence no local echo above.
sync.post({ family: "ocean", mode: "dark" });
console.log("posted the local selection to other windows");

unsubscribe();
sync.destroy();
console.log("adapter destroyed");
