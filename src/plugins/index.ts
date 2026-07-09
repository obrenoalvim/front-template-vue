import type { App } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createHead } from '@unhead/vue/client'
import router from '@/router'
import { i18n } from '@/i18n'
import { installZodI18n } from '@/lib/zod-i18n'
import { useAuthStore } from '@/stores/auth'
import '@/composables/use-theme'

/**
 * Single place wiring up router, state, i18n, and providers.
 * Anything global the app needs on boot gets registered here, not scattered across main.ts.
 */
export function registerPlugins(app: App) {
  app.use(createPinia())
  useAuthStore().init()
  app.use(i18n)
  app.use(createHead({ init: [{ titleTemplate: '%s · front-template-vue' }] }))
  app.use(router)
  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: { retry: 1, staleTime: 30_000 },
      },
    },
  })
  installZodI18n()
}
