<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

const schema = toTypedSchema(
  z.object({
    email: z.string().min(1).email(),
  }),
)

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
})

const [email, emailAttrs] = defineField('email')

const submitted = ref(false)

const onSubmit = handleSubmit(() => {
  submitted.value = true
  resetForm()
})
</script>

<template>
  <form class="flex flex-col gap-3" novalidate @submit="onSubmit">
    <div class="flex flex-col gap-1">
      <label for="email" class="text-sm font-medium">{{ t('home.emailLabel') }}</label>
      <Input
        id="email"
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        placeholder="you@example.com"
      />
      <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
    </div>
    <Button type="submit" class="self-start">{{ t('home.subscribe') }}</Button>
    <p v-if="submitted" class="text-sm text-muted-foreground">{{ t('home.subscribed') }}</p>
  </form>
</template>
