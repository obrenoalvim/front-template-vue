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
usePageSeo({ title: t('auth.login.title'), description: t('auth.login.title') })

const schema = toTypedSchema(
  z.object({
    email: z.string().min(1).email(),
    password: z.string().min(1),
  }),
)

const { defineField, errors, handleSubmit, isSubmitting } = useForm({ validationSchema: schema })
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.login(values)
    toast.success(t('auth.login.success'))
    router.push(localePath('/account'))
  } catch (error) {
    toastError(error)
  }
})
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle>{{ t('auth.login.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-3" novalidate @submit="onSubmit">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">{{ t('auth.login.email') }}</label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">{{ t('auth.login.password') }}</label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>
        <Button type="submit" :disabled="isSubmitting">{{ t('auth.login.submit') }}</Button>
      </form>
      <div class="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
        <LocaleLink to="/forgot-password" class="hover:text-primary">{{
          t('auth.login.forgot')
        }}</LocaleLink>
        <span>
          {{ t('auth.login.noAccount') }}
          <LocaleLink to="/register" class="text-primary hover:underline">{{
            t('auth.login.register')
          }}</LocaleLink>
        </span>
      </div>
    </CardContent>
  </Card>
</template>
