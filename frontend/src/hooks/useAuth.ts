import { useEffect } from 'react'
import { useAuthStore } from '@/context/authStore'

export function useAuth() {
  const { checkAuth, ...rest } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return rest
}
