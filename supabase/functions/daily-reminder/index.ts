/**
 * daily-reminder — Supabase Edge Function
 *
 * Sends a daily accounting reminder email to every active user
 * and inserts a persistent in-app notification.
 *
 * Schedule via Supabase Dashboard → Edge Functions → Schedules:
 *   Cron: "0 18 * * *"  (6 PM UTC daily — adjust to your users' timezone)
 *
 * Required env vars (set in Supabase Dashboard → Settings → Edge Functions):
 *   SUPABASE_URL            — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   RESEND_API_KEY          — your Resend.com API key (free tier: 3000 emails/month)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const APP_URL        = Deno.env.get('APP_URL') ?? 'https://chillnumbers.com'
const FROM_EMAIL     = 'noreply@chillnumbers.com'

// ─── Fetch all users with active sessions (auth.users) ───────────────────────
async function getActiveUsers(): Promise<Array<{ id: string; email: string }>> {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error
  return (data.users ?? [])
    .filter(u => u.email)
    .map(u => ({ id: u.id, email: u.email! }))
}

// ─── Send email via Resend ────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email to', to)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
  }
}

// ─── Build email HTML ─────────────────────────────────────────────────────────
function buildEmailHtml(date: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">Chill Numbers</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Tu asistente de contabilidad</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600">
              📋 Recordatorio diario de contabilidad
            </h2>
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6">
              Hoy es <strong>${date}</strong>. ¿Ya registraste todas tus transacciones del día?
            </p>
            <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6">
              Mantener tu contabilidad al día te ayuda a tomar mejores decisiones financieras y evitar sorpresas al final del mes.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#6366f1;border-radius:8px">
                  <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">
                    Ir al dashboard →
                  </a>
                </td>
              </tr>
            </table>
            <!-- Tips -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;background:#f9fafb;border-radius:8px;padding:20px">
              <tr>
                <td>
                  <p style="margin:0 0 12px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">
                    Acciones rápidas
                  </p>
                  <p style="margin:0 0 8px;color:#6b7280;font-size:14px">
                    ✅ <a href="${APP_URL}/transactions" style="color:#6366f1;text-decoration:none">Registrar transacciones</a>
                  </p>
                  <p style="margin:0 0 8px;color:#6b7280;font-size:14px">
                    📊 <a href="${APP_URL}/reports" style="color:#6366f1;text-decoration:none">Ver reportes</a>
                  </p>
                  <p style="margin:0;color:#6b7280;font-size:14px">
                    📈 <a href="${APP_URL}/analytics" style="color:#6366f1;text-decoration:none">Analizar finanzas</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;color:#9ca3af;font-size:12px">
              Recibes este correo porque tienes una cuenta activa en Chill Numbers.<br>
              <a href="${APP_URL}/settings" style="color:#6366f1;text-decoration:none">Gestionar preferencias</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Insert in-app notification ───────────────────────────────────────────────
async function insertNotification(userId: string, date: string): Promise<void> {
  // Check if already sent today to avoid duplicates on retries
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'reminder')
    .gte('created_at', `${today}T00:00:00Z`)
    .limit(1)

  if (existing && existing.length > 0) return  // already sent today

  await supabase.from('notifications').insert({
    user_id:      userId,
    type:         'reminder',
    priority:     'low',
    title:        '📋 Recordatorio diario',
    message:      `¿Ya registraste tus transacciones de hoy (${date})?`,
    action_url:   '/transactions',
    action_label: 'Registrar ahora',
    is_read:      false,
  })
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async () => {
  try {
    const users = await getActiveUsers()
    const date  = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const subject = `📋 Recordatorio: ¿Ya hiciste tu contabilidad hoy?`
    const html    = buildEmailHtml(date)

    let emailsSent = 0
    let notifsSent = 0

    for (const user of users) {
      // In-app notification (always)
      await insertNotification(user.id, date)
      notifsSent++

      // Email (only if Resend key is configured)
      if (RESEND_API_KEY) {
        await sendEmail(user.email, subject, html)
        emailsSent++
      }
    }

    return new Response(
      JSON.stringify({ ok: true, users: users.length, emailsSent, notifsSent }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('daily-reminder error:', err)
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
