import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (amount: number, lang: string) =>
  new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(amount)

// ─── Labels ──────────────────────────────────────────────────────────────────
const L = {
  en: {
    subject:      (s: string, e: string) => `Your weekly report — ${s} to ${e}`,
    greeting:     (name: string) => `Hi${name ? ` ${name}` : ''}!`,
    intro:        'Here is your financial summary for last week.',
    revenue:      'Revenue',
    expenses:     'Expenses',
    profit:       'Net Profit',
    margin:       'Profit Margin',
    transactions: 'Transactions',
    pending:      'Pending',
    completed:    'Completed',
    positive:     'Positive week',
    negative:     'Negative week',
    viewDashboard:'View Dashboard',
    unsubscribe:  'Unsubscribe from weekly reports',
    footer:       'You are receiving this email because you have weekly reports enabled in Chill Numbers.',
    comparedPrev: 'vs previous week',
    noData:       'No transactions recorded this week.',
  },
  es: {
    subject:      (s: string, e: string) => `Tu reporte semanal — ${s} al ${e}`,
    greeting:     (name: string) => `Hola${name ? ` ${name}` : ''}!`,
    intro:        'Aquí tienes el resumen financiero de la semana pasada.',
    revenue:      'Ingresos',
    expenses:     'Gastos',
    profit:       'Beneficio Neto',
    margin:       'Margen',
    transactions: 'Transacciones',
    pending:      'Pendientes',
    completed:    'Completadas',
    positive:     'Semana positiva',
    negative:     'Semana negativa',
    viewDashboard:'Ver Dashboard',
    unsubscribe:  'Cancelar suscripción a reportes semanales',
    footer:       'Recibes este correo porque tienes los reportes semanales activados en Chill Numbers.',
    comparedPrev: 'vs semana anterior',
    noData:       'No se registraron transacciones esta semana.',
  },
}

// ─── HTML template ────────────────────────────────────────────────────────────
function buildEmail(params: {
  lang: string
  name: string
  weekStart: string
  weekEnd: string
  income: number
  expenses: number
  profit: number
  margin: number
  totalTx: number
  pendingTx: number
  prevIncome: number
  prevExpenses: number
  prevProfit: number
  unsubscribeUrl: string
}): string {
  const l = L[params.lang as 'en' | 'es'] ?? L.es
  const isPositive = params.profit >= 0
  const profitColor = isPositive ? '#276749' : '#9b2c2c'
  const profitBg    = isPositive ? '#f0fff4' : '#fff5f5'
  const profitBorder= isPositive ? '#9ae6b4' : '#feb2b2'

  const diffIncome   = params.income   - params.prevIncome
  const diffExpenses = params.expenses - params.prevExpenses
  const diffProfit   = params.profit   - params.prevProfit

  const arrow = (v: number) => v >= 0 ? '▲' : '▼'
  const diffColor = (v: number, inverse = false) => {
    const good = inverse ? v <= 0 : v >= 0
    return good ? '#276749' : '#9b2c2c'
  }

  const kpi = (label: string, value: string, diff: number, inverse = false) => `
    <td width="25%" style="padding:8px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 14px;text-align:center;">
        <div style="font-size:10px;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${label}</div>
        <div style="font-size:18px;font-weight:800;color:#1a202c;">${value}</div>
        ${params.prevIncome > 0 || params.prevExpenses > 0 ? `
        <div style="font-size:10px;color:${diffColor(diff, inverse)};margin-top:4px;">
          ${arrow(diff)} ${fmt(Math.abs(diff), params.lang)}
        </div>` : ''}
      </div>
    </td>`

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf9;padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:580px;">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1a9e96 0%,#0d7a73 100%);padding:28px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">CHILL NUMBERS</div>
            <div style="font-size:11px;color:#a7f3d0;margin-top:2px;letter-spacing:1px;">FINANZAS INTELIGENTES</div>
          </td>
          <td align="right">
            <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 12px;display:inline-block;">
              <div style="font-size:10px;color:#a7f3d0;font-weight:600;">${params.weekStart}</div>
              <div style="font-size:10px;color:#a7f3d0;">— ${params.weekEnd}</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Greeting -->
  <tr>
    <td style="padding:28px 36px 16px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a202c;">${l.greeting(params.name)}</h1>
      <p style="margin:0;font-size:14px;color:#4a5568;line-height:1.6;">${l.intro}</p>
    </td>
  </tr>

  <!-- KPI Cards -->
  <tr>
    <td style="padding:0 28px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${kpi(l.revenue,  fmt(params.income,   params.lang), diffIncome)}
          ${kpi(l.expenses, fmt(params.expenses, params.lang), diffExpenses, true)}
          ${kpi(l.margin,   `${params.margin.toFixed(1)}%`,    diffProfit)}
          <td width="25%" style="padding:8px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 14px;text-align:center;">
              <div style="font-size:10px;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${l.transactions}</div>
              <div style="font-size:18px;font-weight:800;color:#1a202c;">${params.totalTx}</div>
              <div style="font-size:10px;color:#a0aec0;margin-top:4px;">${params.pendingTx} ${l.pending}</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Profit highlight -->
  <tr>
    <td style="padding:0 36px 24px;">
      <div style="background:${profitBg};border:1px solid ${profitBorder};border-radius:12px;padding:18px 20px;display:flex;align-items:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size:12px;font-weight:600;color:${profitColor};text-transform:uppercase;letter-spacing:0.5px;">${l.profit}</div>
              <div style="font-size:28px;font-weight:900;color:${profitColor};margin-top:4px;">${fmt(params.profit, params.lang)}</div>
            </td>
            <td align="right">
              <div style="background:${profitColor};color:#fff;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;">
                ${isPositive ? l.positive : l.negative}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

  ${params.totalTx === 0 ? `
  <!-- No data -->
  <tr>
    <td style="padding:0 36px 24px;text-align:center;color:#a0aec0;font-size:13px;">${l.noData}</td>
  </tr>` : ''}

  <!-- CTA -->
  <tr>
    <td style="padding:0 36px 28px;text-align:center;">
      <a href="https://chillnumbers.com/es/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#1a9e96,#0d7a73);color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:10px;">
        ${l.viewDashboard} →
      </a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8fafc;padding:18px 36px;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 8px;font-size:11px;color:#a0aec0;text-align:center;line-height:1.6;">
        ${l.footer}
      </p>
      <p style="margin:0;text-align:center;">
        <a href="${params.unsubscribeUrl}" style="font-size:11px;color:#a0aec0;text-decoration:underline;">
          ${l.unsubscribe}
        </a>
      </p>
      <p style="margin:8px 0 0;font-size:10px;color:#cbd5e0;text-align:center;">
        &copy; ${new Date().getFullYear()} Chill Numbers &middot;
        <a href="https://chillnumbers.com" style="color:#1a9e96;text-decoration:none;">chillnumbers.com</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Week range: last Sunday → last Saturday
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const lastSunday = new Date(now)
  lastSunday.setDate(now.getDate() - dayOfWeek - 7)
  const lastSaturday = new Date(lastSunday)
  lastSaturday.setDate(lastSunday.getDate() + 6)

  const toISO = (d: Date) => d.toISOString().split('T')[0]
  const weekStart = toISO(lastSunday)
  const weekEnd   = toISO(lastSaturday)

  // Previous week for comparison
  const prevSunday   = new Date(lastSunday);   prevSunday.setDate(lastSunday.getDate() - 7)
  const prevSaturday = new Date(lastSaturday); prevSaturday.setDate(lastSaturday.getDate() - 7)
  const prevStart = toISO(prevSunday)
  const prevEnd   = toISO(prevSaturday)

  // Format dates for display
  const fmtDate = (d: Date, lang: string) =>
    d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric' })

  // Get all users with weekly_report enabled
  const { data: prefs, error: prefsError } = await supabaseAdmin
    .from('email_preferences')
    .select('user_id, language, unsubscribe_token')
    .eq('weekly_report', true)

  if (prefsError) {
    return NextResponse.json({ error: prefsError.message }, { status: 500 })
  }

  // Also include users who don't have a row yet (default = opted in)
  const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
  const usersWithPrefs = new Set((prefs ?? []).map(p => p.user_id))

  // Users without a row get default language 'es' and are opted in
  const usersToProcess = [
    ...(prefs ?? []),
    ...(allUsers?.users ?? [])
      .filter(u => !usersWithPrefs.has(u.id))
      .map(u => ({
        user_id: u.id,
        language: (u.user_metadata?.language ?? 'es') as string,
        unsubscribe_token: null as string | null,
      }))
  ]

  const results = { sent: 0, skipped: 0, errors: 0 }

  for (const pref of usersToProcess) {
    try {
      // Get user email
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(pref.user_id)
      if (!user?.email) { results.skipped++; continue }

      const lang = pref.language ?? 'es'
      const name = user.user_metadata?.first_name ?? ''

      // Fetch this week's transactions
      const { data: txs } = await supabaseAdmin
        .from('transactions')
        .select('type, amount, status')
        .eq('user_id', pref.user_id)
        .gte('date', weekStart)
        .lte('date', weekEnd)
        .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

      const rows = txs ?? []
      const income   = rows.filter(r => r.type === 1).reduce((s, r) => s + Number(r.amount), 0)
      const expenses = rows.filter(r => r.type === 2).reduce((s, r) => s + Number(r.amount), 0)
      const profit   = income - expenses
      const margin   = income > 0 ? (profit / income) * 100 : 0
      const totalTx  = rows.length
      const pendingTx = rows.filter(r => r.status === 1).length

      // Fetch previous week for comparison
      const { data: prevTxs } = await supabaseAdmin
        .from('transactions')
        .select('type, amount')
        .eq('user_id', pref.user_id)
        .gte('date', prevStart)
        .lte('date', prevEnd)
        .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

      const prevRows    = prevTxs ?? []
      const prevIncome  = prevRows.filter(r => r.type === 1).reduce((s, r) => s + Number(r.amount), 0)
      const prevExpenses= prevRows.filter(r => r.type === 2).reduce((s, r) => s + Number(r.amount), 0)
      const prevProfit  = prevIncome - prevExpenses

      // Ensure unsubscribe token exists
      let token = pref.unsubscribe_token
      if (!token) {
        const { data: newPref } = await supabaseAdmin
          .from('email_preferences')
          .upsert({ user_id: pref.user_id, language: lang, weekly_report: true })
          .select('unsubscribe_token')
          .single()
        token = newPref?.unsubscribe_token ?? 'token'
      }

      const unsubscribeUrl = `https://chillnumbers.com/api/unsubscribe?token=${token}`
      const l = L[lang as 'en' | 'es'] ?? L.es
      const lastSun = new Date(lastSunday)
      const lastSat = new Date(lastSaturday)

      const html = buildEmail({
        lang, name,
        weekStart: fmtDate(lastSun, lang),
        weekEnd:   fmtDate(lastSat, lang),
        income, expenses, profit, margin,
        totalTx, pendingTx,
        prevIncome, prevExpenses, prevProfit,
        unsubscribeUrl,
      })

      await resend.emails.send({
        from:    'Chill Numbers <noreply@chillnumbers.com>',
        to:      user.email,
        subject: l.subject(fmtDate(lastSun, lang), fmtDate(lastSat, lang)),
        html,
      })

      results.sent++
    } catch (err) {
      console.error('Error sending to user', pref.user_id, err)
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, weekStart, weekEnd, ...results })
}
