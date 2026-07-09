import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pt from './locales/pt.json'

export const SUPPORTED_LOCALES = ['en', 'pt'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

/** Preferred locale from a previous visit, or the closest match to the browser language. */
export function detectLocale(): Locale {
  const stored = localStorage.getItem('locale')
  if (isSupportedLocale(stored)) return stored

  const browserLang = navigator.language.slice(0, 2)
  return isSupportedLocale(browserLang) ? browserLang : DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, pt },
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}
