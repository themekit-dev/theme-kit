<script setup lang="ts">
import { ThemeScope as VueThemeScope } from "@theme-kit/vue";
import type { ThemeScopeProps } from "@theme-kit/vue";

const props = defineProps<ThemeScopeProps>();

defineSlots<{ default: () => any }>();
</script>

<template>
  <VueThemeScope v-bind="props">
    <slot />
  </VueThemeScope>
</template>
