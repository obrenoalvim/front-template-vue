<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { SUPPORTED_LOCALES, type Locale } from '@/i18n'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()

function switchTo(locale: Locale) {
  router.push({ name: route.name ?? undefined, params: { ...route.params, locale } })
}
</script>

<template>
  <div class="flex gap-1" role="group" aria-label="Language">
    <Button
      v-for="locale in SUPPORTED_LOCALES"
      :key="locale"
      variant="ghost"
      size="sm"
      :class="route.params.locale === locale ? 'font-bold underline' : ''"
      @click="switchTo(locale)"
    >
      {{ locale.toUpperCase() }}
    </Button>
  </div>
</template>
