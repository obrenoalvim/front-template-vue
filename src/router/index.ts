import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { DEFAULT_LOCALE, detectLocale, isSupportedLocale, setLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:locale(en|pt)',
      children: [
        { path: '', name: 'home', component: HomeView },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPasswordView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPasswordView.vue'),
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('@/views/AccountView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/AdminView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    },
    {
      // No locale in the URL yet: redirect to the detected one, preserving the rest of the path.
      path: '/:pathMatch(.*)*',
      redirect: (to) => `/${detectLocale()}${to.path === '/' ? '' : to.path}`,
    },
  ],
})

// Single centralized guard: syncs the active locale, then enforces auth on protected routes.
router.beforeEach(async (to) => {
  const locale = to.params.locale as string | undefined
  if (isSupportedLocale(locale)) {
    setLocale(locale)
  } else if (locale) {
    return `/${DEFAULT_LOCALE}`
  }

  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', params: { locale: locale ?? DEFAULT_LOCALE } }
  }
  if (to.meta.requiresAdmin) {
    // A hard reload lands here with a token but no fetched user yet — fetch
    // once before deciding, or a real admin would get bounced by this guard.
    if (auth.isAuthenticated && !auth.user) {
      await auth.fetchMe().catch(() => undefined)
    }
    if (auth.user?.role !== 'admin') {
      return { name: 'home', params: { locale: locale ?? DEFAULT_LOCALE } }
    }
  }
})

export default router
