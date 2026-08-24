<script setup lang="ts">
import { ThemeProvider as VueThemeProvider, useThemeRuntime } from "@theme-kit/vue";
import type { ThemeProviderProps } from "@theme-kit/vue";

// The @theme-kit/nuxt plugin already installs an app-wide runtime; pass it
// through so this component never creates a second one.
const props = defineProps<ThemeProviderProps>();
const runtime = useThemeRuntime();

defineSlots<{ default: () => any }>();
</script>

<template>
  <VueThemeProvider :runtime="runtime" v-bind="$attrs">
    <slot />
  </VueThemeProvider>
</template>