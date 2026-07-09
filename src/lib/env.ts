import { z } from 'zod'

// Validated independently of the app's zod error map (src/lib/zod-i18n.ts), since this
// runs before i18n exists — env failures must fail fast with a plain, readable message.
const schema = z.object({
  VITE_API_URL: z
    .string()
    .url({ message: 'VITE_API_URL must be a valid URL, e.g. http://localhost:8000' }),
  VITE_SITE_URL: z
    .string()
    .url({ message: 'VITE_SITE_URL must be a valid URL, e.g. http://localhost:5173' }),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(
    `Invalid environment variables:\n${issues}\n\nCheck your .env file against .env.example.`,
  )
}

export const env = parsed.data
