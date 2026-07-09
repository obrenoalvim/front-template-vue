import { toast } from 'vue-sonner'
import { ApiError } from '@/lib/api-client'
import { i18n } from '@/i18n'

/** Shows a toast for a caught request error, using the API message when available. */
export function toastError(error: unknown) {
  const message = error instanceof ApiError ? error.message : i18n.global.t('errors.generic')
  toast.error(message)
}

export { toast }
