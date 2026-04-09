/**
 * daily-reminder — Supabase Edge Function
 *
 * Sends a daily accounting reminder email to every active user
 * and inserts a persistent in-app notification.
 * Emails are sent in the user's preferred language (es/en).
 *
 * Schedule via Supabase Dashboard → Edge Functions → Schedules:
 *   Cron: "0 18 * * *"  (6 PM UTC daily)
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   RESEND_API_KEY — your Resend.com API key
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const APP_URL        = Deno.env.get('APP_URL') ?? 'https://chillnumbers.com'
const FROM_EMAIL     = 'noreply@chillnumbers.com'

// ─── Labels ──────────────────────────────────────────────────────────────────
const L = {
  es: {
    subject:     '📋 Recordatorio: ¿Ya hiciste tu contabilidad hoy?',
    heading:     '📋 Recordatorio diario de contabilidad',
    intro:       (date: string) => `Hoy es <strong>${date}</strong>. ¿Ya registraste todas tus transacciones del día?`,
    body:        'Mantener tu contabilidad al día te ayuda a tomar mejores decisiones financieras y evitar sorpresas al final del mes.',
    cta:         'Ir al dashboard →',
    quickTitle:  'Acciones rápidas',
    link1:       'Registrar transacciones',
    link2:       'Ver reportes',
    link3:       'Analizar finanzas',
    footer:      'Recibes este correo porque tienes una cuenta activa en Chill Numbers.',
    manage:      'Gestionar preferencias',
    notifTitle:  '📋 Recordatorio diario',
    notifMsg:    (date: string) => `¿Ya registraste tus transacciones de hoy (${date})?`,
    notifAction: 'Registrar ahora',
  },
  en: {
    subject:     '📋 Reminder: Did you do your bookkeeping today?',
    heading:     '📋 Daily bookkeeping reminder',
    intro:       (date: string) => `Today is <strong>${date}</strong>. Have you recorded all your transactions for the day?`,
    body:        'Keeping your books up to date helps you make better financial decisions and avoid surprises at the end of the month.',
    cta:         'Go to dashboard →',
    quickTitle:  'Quick actions',
    link1:       'Record transactions',
    link2:       'View reports',
    link3:       'Analyze finances',
    footer:      'You are receiving this email because you have an active account on Chill Numbers.',
    manage:      'Manage preferences',
    notifTitle:  '📋 Daily reminder',
    notifMsg:    (date: string) => `Have you recorded your transactions for today (${date})?`,
    notifAction: 'Record now',
  },
}

// ─── Fetch all users ──────────────────────────────────────────────────────────
async function getActiveUsers(): Promise<Array<{ id: string; email: string; lang: string }>> {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error

  // Get language preferences from email_preferences table
  const { data: prefs } = await supabase
    .from('email_preferences')
    .select('user_id, language')

  const prefMap = new Map((prefs ?? []).map((p: any) => [p.user_id, p.language]))

  return (data.users ?? [])
    .filter(u => u.email)
    .map(u => ({
      id:    u.id,
      email: u.email!,
      // Priority: email_preferences table → user_metadata.language → 'es'
      lang:  prefMap.get(u.id) ?? u.user_metadata?.language ?? 'es',
    }))
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
function buildEmailHtml(date: string, lang: string): string {
  const l = L[lang as 'en' | 'es'] ?? L.es
  const locale = lang === 'en' ? 'en-US' : 'es-ES'
  const dashUrl = `${APP_URL}/${lang}/dashboard`
  const txUrl   = `${APP_URL}/${lang}/transactions`
  const rptUrl  = `${APP_URL}/${lang}/reports`
  const anlUrl  = `${APP_URL}/${lang}/analytics`
  const setUrl  = `${APP_URL}/${lang}/settings`

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf9;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a9e96 0%,#0d7a73 100%);padding:28px 36px;text-align:center">
            <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px">CHILL NUMBERS</div>
            <div style="font-size:11px;color:#a7f3d0;margin-top:4px;letter-spacing:1px">FINANZAS INTELIGENTES</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 24px">
            <h2 style="margin:0 0 16px;color:#1a202c;font-size:18px;font-weight:700">${l.heading}</h2>
            <p style="margin:0 0 14px;color:#4a5568;font-size:14px;line-height:1.7">${l.intro(date)}</p>
            <p style="margin:0 0 24px;color:#4a5568;font-size:14px;line-height:1.7">${l.body}</p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#1a9e96,#0d7a73);border-radius:10px">
                  <a href="${dashUrl}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none">
                    ${l.cta}
                  </a>
                </td>
              </tr>
            </table>
            <!-- Quick links -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#f8fafc;border-radius:10px;padding:18px 20px">
              <tr>
                <td>
                  <p style="margin:0 0 10px;color:#2d3748;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${l.quickTitle}</p>
                  <p style="margin:0 0 7px;color:#718096;font-size:13px">✅ <a href="${txUrl}" style="color:#1a9e96;text-decoration:none">${l.link1}</a></p>
                  <p style="margin:0 0 7px;color:#718096;font-size:13px">📊 <a href="${rptUrl}" style="color:#1a9e96;text-decoration:none">${l.link2}</a></p>
                  <p style="margin:0;color:#718096;font-size:13px">📈 <a href="${anlUrl}" style="color:#1a9e96;text-decoration:none">${l.link3}</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:18px 36px;border-top:1px solid #e2e8f0;text-align:center">
            <p style="margin:0 0 6px;color:#a0aec0;font-size:11px;line-height:1.6">${l.footer}</p>
            <a href="${setUrl}" style="color:#1a9e96;font-size:11px;text-decoration:none">${l.manage}</a>
            <p style="margin:8px 0 0;color:#cbd5e0;font-size:10px">
              &copy; ${new Date().getFullYear()} Chill Numbers &middot;
              <a href="https://chillnumbers.com" style="color:#1a9e96;text-decoration:none">chillnumbers.com</a>
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
async function insertNotification(userId: string, date: string, lang: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'reminder')
    .gte('created_at', `${today}T00:00:00Z`)
    .limit(1)

  if (existing && existing.length > 0) return

  const l = L[lang as 'en' | 'es'] ?? L.es
  await supabase.from('notifications').insert({
    user_id:      userId,
    type:         'reminder',
    priority:     'low',
    title:        l.notifTitle,
    message:      l.notifMsg(date),
    action_url:   `/${lang}/transactions`,
    action_label: l.notifAction,
    is_read:      false,
  })
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async () => {
  try {
    const users = await getActiveUsers()
    let emailsSent = 0, notifsSent = 0

    for (const user of users) {
      const lang   = user.lang === 'en' ? 'en' : 'es'
      const locale = lang === 'en' ? 'en-US' : 'es-ES'
      const date   = new Date().toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const l = L[lang]

      await insertNotification(user.id, date, lang)
      notifsSent++

      if (RESEND_API_KEY) {
        await sendEmail(user.email, l.subject, buildEmailHtml(date, lang))
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
