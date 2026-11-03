import { NextRequest, NextResponse } from 'next/server'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 },
      )
    }

    // Verificar el token con la API de Cloudflare (server-side, secret nunca expuesto)
    const formData = new FormData()
    formData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET!)
    formData.append('response', token)
    // Agregar IP del usuario para mayor seguridad
    const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? ''
    if (ip) formData.append('remoteip', ip)

    const res = await fetch(VERIFY_URL, { method: 'POST', body: formData })
    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: 'Verificación fallida. Por favor intenta de nuevo.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error interno al verificar el captcha.' },
      { status: 500 },
    )
  }
}
