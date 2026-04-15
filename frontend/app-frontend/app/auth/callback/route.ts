import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') // 'signup' | 'recovery' | 'email_change'

  // Render internally uses localhost:10000 — use the real domain from headers
  const host = request.headers.get('x-forwarded-host')
    ?? request.headers.get('host')
    ?? new URL(origin).host
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const baseUrl = `${proto}://${host}`

  // Detect locale from referer
  const referer = request.headers.get('referer') ?? ''
  const locale  = referer.includes('/en/') ? 'en' : 'es'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // ── OAuth / magic link flow: ?code= ──────────────────────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${baseUrl}/${locale}/auth/forgot-password?reset=1`)
      }
      return NextResponse.redirect(`${baseUrl}/${locale}/subscribe/checkout`)
    }
  }

  // ── Email verification flow: ?token_hash= ────────────────────────────────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${baseUrl}/${locale}/auth/forgot-password?reset=1`)
      }
      // signup verification → go to login with verified banner
      // The login page will redirect through checkout gate after login
      return NextResponse.redirect(`${baseUrl}/${locale}/auth/login?verified=1`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/es/auth/login?error=oauth`)
}
