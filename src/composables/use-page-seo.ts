import { useSeoMeta, useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { env } from '@/lib/env'

const SITE_URL = env.VITE_SITE_URL

/** Sets per-page title/description, OG/Twitter tags, and the canonical URL. Call once per view. */
export function usePageSeo(input: { title: string; description: string }) {
  const route = useRoute()

  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  })

  useHead({
    link: [{ rel: 'canonical', href: `${SITE_URL}${route.fullPath}` }],
  })
}
