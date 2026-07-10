<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Toaster } from 'vue-sonner'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import LocaleLink from '@/components/LocaleLink.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/use-locale-path'
import { isDark } from '@/composables/use-theme'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const localePath = useLocalePath()

function logout() {
  auth.logout()
  router.push(localePath('/'))
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="flex items-center justify-between border-b px-6 py-4">
      <nav class="flex gap-4 text-sm font-medium">
        <LocaleLink to="/" class="hover:text-primary">{{ t('nav.home') }}</LocaleLink>
        <LocaleLink v-if="auth.isAuthenticated" to="/account" class="hover:text-primary">{{
          t('nav.account')
        }}</LocaleLink>
        <LocaleLink v-if="auth.user?.role === 'admin'" to="/admin" class="hover:text-primary">{{
          t('nav.admin')
        }}</LocaleLink>
      </nav>
      <div class="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
        <Button v-if="auth.isAuthenticated" variant="ghost" size="sm" @click="logout">{{
          t('nav.logout')
        }}</Button>
        <LocaleLink v-else to="/login">
          <Button variant="ghost" size="sm" as="span">{{ t('nav.login') }}</Button>
        </LocaleLink>
      </div>
    </header>

    <main class="flex justify-center p-6">
      <div class="flex w-full max-w-5xl flex-col items-center">
        <RouterView />
      </div>
    </main>

    <Toaster :theme="isDark ? 'dark' : 'light'" position="bottom-right" rich-colors />
  </div>
</template>
