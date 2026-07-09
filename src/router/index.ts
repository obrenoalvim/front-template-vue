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
router.beforeEach((to) => {
  const locale = to.params.locale as string | undefined
  if (isSupportedLocale(locale)) {
    setLocale(locale)
  } else if (locale) {
    return `/${DEFAULT_LOCALE}`
  }

  if (to.meta.requiresAuth && !useAuthStore().isAuthenticated) {
    return { name: 'login', params: { locale: locale ?? DEFAULT_LOCALE } }
  }
})

export default router
