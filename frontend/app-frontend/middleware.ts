import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// El middleware solo maneja i18n (detección de locale y routing).
// La protección de rutas la maneja useAuth en el cliente,
// que usa supabase.auth.getSession() directamente — más confiable
// que intentar leer las cookies de Supabase desde el edge.
export default createIntlMiddleware(routing)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
