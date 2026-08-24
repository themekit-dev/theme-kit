<script setup lang="ts">
import { ThemeInspector as VueThemeInspector } from "@theme-kit/vue";
import type { ThemeInspectorProps } from "@theme-kit/vue";

const props = defineProps<ThemeInspectorProps>();
</script>

<template>
  <VueThemeInspector v-bind="props" />
</template>
