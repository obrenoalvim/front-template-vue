<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { toastError } from '@/lib/toast'
import { usePageSeo } from '@/composables/use-page-seo'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const auth = useAuthStore()
const sent = ref(false)
usePageSeo({ title: t('auth.forgot.title'), description: t('auth.forgot.description') })

const schema = toTypedSchema(z.object({ email: z.string().min(1).email() }))
const { defineField, errors, handleSubmit, isSubmitting } = useForm({ validationSchema: schema })
const [email, emailAttrs] = defineField('email')

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.forgotPassword(values.email)
    sent.value = true
  } catch (error) {
    toastError(error)
  }
})
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle>{{ t('auth.forgot.title') }}</CardTitle>
      <CardDescription>{{ t('auth.forgot.description') }}</CardDescription>
    </CardHeader>
    <CardContent>
      <p v-if="sent" class="text-sm text-muted-foreground">{{ t('auth.forgot.success') }}</p>
      <form v-else class="flex flex-col gap-3" novalidate @submit="onSubmit">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">{{ t('auth.forgot.email') }}</label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
        <Button type="submit" :disabled="isSubmitting">{{ t('auth.forgot.submit') }}</Button>
      </form>
    </CardContent>
  </Card>
</template>
