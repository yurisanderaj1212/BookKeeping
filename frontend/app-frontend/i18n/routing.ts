import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
})

// Typed navigation helpers — use these instead of next/navigation in app code
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
