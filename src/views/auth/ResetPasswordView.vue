<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/use-locale-path'
import { toast, toastError } from '@/lib/toast'
import { usePageSeo } from '@/composables/use-page-seo'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const localePath = useLocalePath()
usePageSeo({ title: t('auth.reset.title'), description: t('auth.reset.title') })

const email = route.query.email as string | undefined
const token = route.query.token as string | undefined

const schema = toTypedSchema(
  z
    .object({
      password: z.string().min(8),
      password_confirmation: z.string().min(1),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('validation.passwordMismatch'),
      path: ['password_confirmation'],
    }),
)

const { defineField, errors, handleSubmit, isSubmitting } = useForm({ validationSchema: schema })
const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('password_confirmation')
const missingLink = ref(!email || !token)

const onSubmit = handleSubmit(async (values) => {
  if (!email || !token) return
  try {
    await auth.resetPassword({ email, token, ...values })
    toast.success(t('auth.reset.success'))
    router.push(localePath('/login'))
  } catch (error) {
    toastError(error)
  }
})
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle>{{ t('auth.reset.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <p v-if="missingLink" class="text-sm text-destructive">{{ t('auth.reset.invalidLink') }}</p>
      <form v-else class="flex flex-col gap-3" novalidate @submit="onSubmit">
        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">{{ t('auth.reset.password') }}</label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="password_confirmation" class="text-sm font-medium">{{
            t('auth.reset.passwordConfirmation')
          }}</label>
          <Input
            id="password_confirmation"
            v-model="passwordConfirmation"
            v-bind="passwordConfirmationAttrs"
            type="password"
          />
          <p v-if="errors.password_confirmation" class="text-sm text-destructive">
            {{ errors.password_confirmation }}
          </p>
        </div>
        <Button type="submit" :disabled="isSubmitting">{{ t('auth.reset.submit') }}</Button>
      </form>
    </CardContent>
  </Card>
</template>
