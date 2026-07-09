import { z } from 'zod'
import { i18n } from '@/i18n'

/**
 * Routes every zod validation message through vue-i18n, so form errors are
 * translated automatically without repeating messages per schema/field.
 */
export function installZodI18n() {
  const errorMap: z.ZodErrorMap = (issue, ctx) => {
    const { t } = i18n.global

    if (issue.code === 'invalid_type' && issue.received === 'undefined') {
      return { message: t('validation.required') }
    }
    if (issue.code === 'invalid_string' && issue.validation === 'email') {
      return { message: t('validation.email') }
    }
    if (issue.code === 'too_small' && issue.type === 'string') {
      return { message: t('validation.minLength', { min: issue.minimum }) }
    }

    return { message: ctx.defaultError }
  }

  z.setErrorMap(errorMap)
}
