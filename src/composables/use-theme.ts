import { useDark, useToggle } from '@vueuse/core'

/** Central dark/light mode state. Persists to localStorage, respects OS preference on first visit. */
export const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

export const toggleDark = useToggle(isDark)
