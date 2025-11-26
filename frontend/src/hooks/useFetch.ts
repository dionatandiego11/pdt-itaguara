import { useState, useCallback } from 'react'

interface UseFetchOptions {
  skip?: boolean
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options?: UseFetchOptions
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!options?.skip)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  return { data, loading, error, refetch }
}
