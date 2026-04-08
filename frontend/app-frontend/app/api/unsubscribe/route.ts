import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new NextResponse(page('Token inválido', 'El enlace de cancelación no es válido.'), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const { error } = await supabaseAdmin
    .from('email_preferences')
    .update({ weekly_report: false })
    .eq('unsubscribe_token', token)

  if (error) {
    return new NextResponse(page('Error', 'No se pudo procesar tu solicitud. Intenta de nuevo.'), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return new NextResponse(page(
    'Cancelación exitosa',
    'Has cancelado los reportes semanales. Puedes reactivarlos en cualquier momento desde Configuración en la app.'
  ), { headers: { 'Content-Type': 'text/html' } })
}

function page(title: string, message: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Chill Numbers</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf9;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#fff;border-radius:16px;padding:48px 40px;max-width:420px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="font-size:22px;font-weight:900;color:#1a9e96;letter-spacing:-0.5px;margin-bottom:24px;">CHILL NUMBERS</div>
    <div style="width:56px;height:56px;background:#e6fffa;border-radius:50%;margin:0 auto 20px;line-height:56px;font-size:24px;">✓</div>
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1a202c;">${title}</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#4a5568;line-height:1.6;">${message}</p>
    <a href="https://chillnumbers.com" style="display:inline-block;background:linear-gradient(135deg,#1a9e96,#0d7a73);color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">
      Ir a la app
    </a>
  </div>
</body>
</html>`
}
