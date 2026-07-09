<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLocalePath } from '@/composables/use-locale-path'

const props = defineProps<{ to: string }>()
const localePath = useLocalePath()
</script>

<template>
  <RouterLink :to="localePath(props.to)">
    <slot />
  </RouterLink>
</template>
