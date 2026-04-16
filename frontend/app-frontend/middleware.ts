import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing)

export default function middleware(request: NextRequest) {
  // next-intl reads NEXT_LOCALE cookie automatically to determine locale.
  // We just pass through to the intl middleware — it handles everything.
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|auth/callback|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
