import { useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export const useCleanUTM = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const pathname = router.state.location.pathname

  useEffect(() => {
    const searchString = window.location.search
    if (!searchString || !searchString.includes('utm_')) return

    const params = new URLSearchParams(searchString)
    const keysToDelete: string[] = []

    for (const key of params.keys()) {
      if (key.startsWith('utm_')) {
        keysToDelete.push(key)
      }
    }

    if (keysToDelete.length === 0) return

    for (const key of keysToDelete) {
      params.delete(key)
    }

    if (params.size === 0) {
      navigate({ to: pathname, replace: true })
    } else {
      navigate({
        to: pathname,
        search: Object.fromEntries(params),
        replace: true,
      })
    }
  }, [pathname, navigate])
}
