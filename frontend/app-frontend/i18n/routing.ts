import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Idiomas soportados
  locales: ['es', 'en'],

  // Idioma por defecto — la app está en español
  defaultLocale: 'es',

  // /dashboard → /es/dashboard automáticamente
  // El prefijo del idioma por defecto se omite en la URL
  localePrefix: 'as-needed',
})
