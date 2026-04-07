import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Render internally uses localhost:10000 — use the real domain from headers
  const host = request.headers.get('x-forwarded-host')
    ?? request.headers.get('host')
    ?? new URL(origin).host
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const baseUrl = `${proto}://${host}`

  // Detect locale from referer
  const referer = request.headers.get('referer') ?? ''
  const locale  = referer.includes('/en/') ? 'en' : 'es'

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}/${locale}/dashboard`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/es/auth/login?error=oauth`)
}
