<script setup lang="ts">
import { Sun, Moon } from '@lucide/vue'
import { isDark, toggleDark } from '@/composables/use-theme'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="ghost" size="icon" aria-label="Toggle theme" @click="toggleDark()">
    <Sun v-if="isDark" class="size-4" />
    <Moon v-else class="size-4" />
  </Button>
</template>
