import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest } from 'next/server'

const intlMiddleware = createIntlMiddleware({
  ...routing,
  // next-intl will check Accept-Language header automatically
  // We also check our custom locale cookie below
})

export default function middleware(request: NextRequest) {
  // Check for user's saved locale preference cookie
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
    // If URL doesn't already have a locale prefix, let intl middleware handle it
    // The cookie will be read by next-intl automatically via NEXT_LOCALE cookie
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|auth/callback|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
