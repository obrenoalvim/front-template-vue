import { useRoute } from 'vue-router'
import { DEFAULT_LOCALE } from '@/i18n'

/** Builds a locale-prefixed path from the current route's locale, e.g. localePath('/') -> '/en'. */
export function useLocalePath() {
  const route = useRoute()

  return (path: string) => {
    const locale = (route.params.locale as string | undefined) ?? DEFAULT_LOCALE
    const clean = path.startsWith('/') ? path.slice(1) : path
    return clean ? `/${locale}/${clean}` : `/${locale}`
  }
}
