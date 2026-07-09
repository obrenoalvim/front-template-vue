<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ExampleForm from '@/components/ExampleForm.vue'
import { usePageSeo } from '@/composables/use-page-seo'

const { t } = useI18n()
usePageSeo({ title: t('home.title'), description: t('home.description') })
</script>

<template>
  <Card class="max-w-md">
    <CardHeader>
      <CardTitle>{{ t('home.title') }}</CardTitle>
      <CardDescription>{{ t('home.description') }}</CardDescription>
    </CardHeader>
    <CardContent>
      <ExampleForm />
    </CardContent>
  </Card>
</template>
