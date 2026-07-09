<script setup lang="ts">
import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/use-locale-path'
import { toast, toastError } from '@/lib/toast'
import { usePageSeo } from '@/composables/use-page-seo'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const localePath = useLocalePath()
usePageSeo({ title: t('account.title'), description: t('account.title') })

const { data: user, isLoading } = useQuery({
  queryKey: ['account', 'me'],
  queryFn: () => auth.fetchMe(),
})

const passwordSchema = toTypedSchema(
  z
    .object({
      current_password: z.string().min(1),
      password: z.string().min(8),
      password_confirmation: z.string().min(1),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('validation.passwordMismatch'),
      path: ['password_confirmation'],
    }),
)

const passwordForm = useForm({ validationSchema: passwordSchema })
const [currentPassword, currentPasswordAttrs] = passwordForm.defineField('current_password')
const [newPassword, newPasswordAttrs] = passwordForm.defineField('password')
const [newPasswordConfirmation, newPasswordConfirmationAttrs] =
  passwordForm.defineField('password_confirmation')

const onChangePassword = passwordForm.handleSubmit(async (values) => {
  try {
    await auth.changePassword(values)
    toast.success(t('account.changePassword.success'))
    passwordForm.resetForm()
  } catch (error) {
    toastError(error)
  }
})

const deletePassword = ref('')
const isDeleting = ref(false)

async function onDeleteAccount() {
  isDeleting.value = true
  try {
    await auth.deleteAccount(deletePassword.value)
    toast.success(t('account.danger.success'))
    router.push(localePath('/'))
  } catch (error) {
    toastError(error)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex max-w-sm flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('account.title') }}</CardTitle>
      </CardHeader>
      <CardContent v-if="!isLoading && user" class="flex flex-col gap-1 text-sm">
        <p>
          <span class="text-muted-foreground">{{ t('account.name') }}:</span> {{ user.name }}
        </p>
        <p>
          <span class="text-muted-foreground">{{ t('account.email') }}:</span> {{ user.email }}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>{{ t('account.changePassword.title') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="flex flex-col gap-3" novalidate @submit="onChangePassword">
          <div class="flex flex-col gap-1">
            <label for="current_password" class="text-sm font-medium">{{
              t('account.changePassword.current')
            }}</label>
            <Input
              id="current_password"
              v-model="currentPassword"
              v-bind="currentPasswordAttrs"
              type="password"
            />
            <p v-if="passwordForm.errors.value.current_password" class="text-sm text-destructive">
              {{ passwordForm.errors.value.current_password }}
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <label for="new_password" class="text-sm font-medium">{{
              t('account.changePassword.new')
            }}</label>
            <Input
              id="new_password"
              v-model="newPassword"
              v-bind="newPasswordAttrs"
              type="password"
            />
            <p v-if="passwordForm.errors.value.password" class="text-sm text-destructive">
              {{ passwordForm.errors.value.password }}
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <label for="new_password_confirmation" class="text-sm font-medium">{{
              t('account.changePassword.confirmation')
            }}</label>
            <Input
              id="new_password_confirmation"
              v-model="newPasswordConfirmation"
              v-bind="newPasswordConfirmationAttrs"
              type="password"
            />
            <p
              v-if="passwordForm.errors.value.password_confirmation"
              class="text-sm text-destructive"
            >
              {{ passwordForm.errors.value.password_confirmation }}
            </p>
          </div>
          <Button type="submit" :disabled="passwordForm.isSubmitting.value">
            {{ t('account.changePassword.submit') }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card class="border-destructive/50">
      <CardHeader>
        <CardTitle>{{ t('account.danger.title') }}</CardTitle>
        <CardDescription>{{ t('account.danger.description') }}</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <Input
          v-model="deletePassword"
          type="password"
          :placeholder="t('account.danger.password')"
        />
        <Button
          variant="destructive"
          :disabled="!deletePassword || isDeleting"
          @click="onDeleteAccount"
        >
          {{ t('account.danger.submit') }}
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
