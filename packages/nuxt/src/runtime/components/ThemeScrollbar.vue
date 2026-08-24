<script setup lang="ts">
import { ThemeScrollbar as VueThemeScrollbar } from "@theme-kit/vue";
import type { ThemeScrollbarProps } from "@theme-kit/vue";

const props = defineProps<ThemeScrollbarProps>();

defineSlots<{ default: () => any }>();
</script>

<template>
  <VueThemeScrollbar v-bind="props">
    <slot />
  </VueThemeScrollbar>
</template>