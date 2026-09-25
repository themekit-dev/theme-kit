import { createPluginManager, type ThemeDefinition, type ThemePlugin } from "@theme-kit/core";

/** A plugin is a unique `name` plus any subset of the lifecycle hooks. */
const logger: ThemePlugin = {
  name: "logger",
  priority: 5, // lower runs first; default is 10
  onAfterThemeChange: ({ theme }) => {
    console.log("[logger] theme is now", theme.name);
  },
  onBeforePersist: ({ selection }) => {
    console.log("[logger] persisting", selection);
  },
};

const analytics: ThemePlugin = {
  name: "analytics",
  onAfterThemeChange: ({ theme }) => {
    console.log("[analytics] track theme_change", theme.name);
  },
};

const manager = createPluginManager<ThemeDefinition>();
manager.use(logger);
manager.use(analytics);

console.log(
  "registered (priority order):",
  manager.list().map((p) => p.name).join(", "),
);
console.log("lookup by name:", manager.get("logger")?.name);

/** Returns `true` when the plugin was present. */
console.log("removed analytics:", manager.remove("analytics"));

/** Invokes `onDestroy` on every remaining plugin and clears the registry. */
manager.destroy();
console.log("after destroy:", manager.list().length);
