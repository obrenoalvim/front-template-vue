<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/use-locale-path'
import { toast, toastError } from '@/lib/toast'
import { usePageSeo } from '@/composables/use-page-seo'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import LocaleLink from '@/components/LocaleLink.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const localePath = useLocalePath()
usePageSeo({ title: t('auth.register.title'), description: t('auth.register.title') })

// t() here runs once at schema build time, so this message won't re-translate on a later locale switch.
const schema = toTypedSchema(
  z
    .object({
      name: z.string().min(1),
      email: z.string().min(1).email(),
      password: z.string().min(8),
      password_confirmation: z.string().min(1),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('validation.passwordMismatch'),
      path: ['password_confirmation'],
    }),
)

const { defineField, errors, handleSubmit, isSubmitting } = useForm({ validationSchema: schema })
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('password_confirmation')

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.register(values)
    toast.success(t('auth.register.success'))
    router.push(localePath('/account'))
  } catch (error) {
    toastError(error)
  }
})
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle>{{ t('auth.register.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-3" novalidate @submit="onSubmit">
        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium">{{ t('auth.register.name') }}</label>
          <Input id="name" v-model="name" v-bind="nameAttrs" />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">{{ t('auth.register.email') }}</label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">{{
            t('auth.register.password')
          }}</label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="password_confirmation" class="text-sm font-medium">{{
            t('auth.register.passwordConfirmation')
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
        <Button type="submit" :disabled="isSubmitting">{{ t('auth.register.submit') }}</Button>
      </form>
      <p class="mt-4 text-sm text-muted-foreground">
        {{ t('auth.register.haveAccount') }}
        <LocaleLink to="/login" class="text-primary hover:underline">{{
          t('auth.register.login')
        }}</LocaleLink>
      </p>
    </CardContent>
  </Card>
</template>
