import { defineStore } from 'pinia'
import { api, setAuthToken } from '@/lib/api-client'

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
}

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem(TOKEN_KEY) as string | null,
  }),

  getters: {
    isAuthenticated: (state) => state.token !== null,
  },

  actions: {
    init() {
      if (this.token) setAuthToken(this.token)
    },

    setSession(user: User, token: string) {
      this.user = user
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
      setAuthToken(token)
    },

    async register(payload: {
      name: string
      email: string
      password: string
      password_confirmation: string
    }) {
      const { user, token } = await api.post<{ user: User; token: string }>(
        '/api/auth/register',
        payload,
      )
      this.setSession(user, token)
    },

    async login(payload: { email: string; password: string }) {
      const { user, token } = await api.post<{ user: User; token: string }>(
        '/api/auth/login',
        payload,
      )
      this.setSession(user, token)
    },

    async logout() {
      if (this.token) {
        await api.post('/api/auth/logout').catch(() => undefined)
      }
      this.user = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      setAuthToken(null)
    },

    async fetchMe() {
      const { user } = await api.get<{ user: User }>('/api/account')
      this.user = user
      return user
    },

    async forgotPassword(email: string) {
      return api.post<{ message: string }>('/api/auth/forgot-password', { email })
    },

    async resetPassword(payload: {
      email: string
      token: string
      password: string
      password_confirmation: string
    }) {
      return api.post<{ message: string }>('/api/auth/reset-password', payload)
    },

    async changePassword(payload: {
      current_password: string
      password: string
      password_confirmation: string
    }) {
      return api.put<{ message: string }>('/api/account/password', payload)
    },

    async deleteAccount(password: string) {
      await api.delete('/api/account', { password })
      this.user = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      setAuthToken(null)
    },
  },
})
