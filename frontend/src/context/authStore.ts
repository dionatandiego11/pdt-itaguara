import { create } from 'zustand'
import { User, AuthResponse } from '@/types/auth'
import { apiClient } from '@/services/api'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const response: AuthResponse = await apiClient.login({ username, password })
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (username, email, password, fullName) => {
    set({ isLoading: true })
    try {
      const response: AuthResponse = await apiClient.register({
        username,
        email,
        password,
        full_name: fullName,
      })
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Register failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  setUser: (user) => {
    set({ user })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ isAuthenticated: false })
      return
    }

    try {
      const user = await apiClient.getCurrentUser()
      set({
        user,
        token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('access_token')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })
    }
  },
}))
