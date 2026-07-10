import { defineStore } from 'pinia'
import { api, refreshWithToken, setAuthToken, setRefreshHandler } from '@/lib/api-client'

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  role: 'user' | 'admin'
}

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem(TOKEN_KEY) as string | null,
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) as string | null,
  }),

  getters: {
    isAuthenticated: (state) => state.token !== null,
  },

  actions: {
    init() {
      if (this.token) setAuthToken(this.token)
      setRefreshHandler(() => this.refreshSession())
    },

    setSession(user: User, accessToken: string, refreshToken: string) {
      this.user = user
      this.setTokens(accessToken, refreshToken)
    },

    setTokens(accessToken: string, refreshToken: string) {
      this.token = accessToken
      this.refreshToken = refreshToken
      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      setAuthToken(accessToken)
    },

    /** Registered as the api-client's 401 handler — not called directly elsewhere. */
    async refreshSession(): Promise<string | null> {
      if (!this.refreshToken) return null
      try {
        const { accessToken, refreshToken } = await refreshWithToken(this.refreshToken)
        this.setTokens(accessToken, refreshToken)
        return accessToken
      } catch {
        await this.logout()
        return null
      }
    },

    async register(payload: {
      name: string
      email: string
      password: string
      password_confirmation: string
    }) {
      const { user, accessToken, refreshToken } = await api.post<{
        user: User
        accessToken: string
        refreshToken: string
      }>('/api/auth/register', payload)
      this.setSession(user, accessToken, refreshToken)
    },

    async login(payload: { email: string; password: string }) {
      const { user, accessToken, refreshToken } = await api.post<{
        user: User
        accessToken: string
        refreshToken: string
      }>('/api/auth/login', payload)
      this.setSession(user, accessToken, refreshToken)
    },

    async logout() {
      if (this.token) {
        await api
          .post('/api/auth/logout', { refresh_token: this.refreshToken })
          .catch(() => undefined)
      }
      this.user = null
      this.token = null
      this.refreshToken = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
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
      this.refreshToken = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      setAuthToken(null)
    },
  },
})
