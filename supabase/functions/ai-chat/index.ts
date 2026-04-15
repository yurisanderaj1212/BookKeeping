// Supabase Edge Function — ai-chat
// Calls Google Gemini Flash (free tier) to power the in-app AI assistant.
//
// Secret needed (Dashboard → Edge Functions → Manage Secrets):
//   GEMINI_API_KEY = your key from https://aistudio.google.com/app/apikey

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
// Free tier models per Google AI documentation (April 2026)
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',  // free tier, high-volume, low latency
  'gemini-3-flash-preview',          // free tier, Pro-level intelligence
]
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── System prompt — restricts the AI to Chill Numbers topics ─────────────────
const SYSTEM_PROMPT = `You are the AI assistant for Chill Numbers, a financial management web app for small businesses and individuals.

Your role is to help users understand and use the Chill Numbers platform. You are friendly, concise, and professional.

WHAT YOU CAN HELP WITH:
- How to use any feature of Chill Numbers (transactions, accounts, reports, analytics, employees, settings)
- Explaining financial concepts in simple terms (income, expenses, profit, margins, weekly close, etc.)
- Interpreting the user's financial data shown in the app
- Troubleshooting issues within the app
- Best practices for bookkeeping and financial management
- Understanding reports and analytics
- Bank account syncing via Plaid
- Subscription and billing questions

WHAT YOU MUST NOT DO:
- Answer questions unrelated to Chill Numbers or personal/business finance
- Provide legal, tax, or investment advice
- Discuss competitors or other software
- Share personal opinions on non-financial topics
- Engage in casual conversation unrelated to the app

If a user asks something outside your scope, politely redirect them:
"I'm here to help you with Chill Numbers and your business finances. Is there something specific about the app I can help you with?"

Keep responses concise — 2-4 sentences for simple questions, up to 6-8 sentences for complex ones.
Use bullet points when listing steps or features.
Always be encouraging and supportive.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Auth check — decode JWT locally (same pattern as plaid function)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

  const token = authHeader.replace('Bearer ', '')
  let userId: string | null = null
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) throw new Error('Invalid token')
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return new Response(JSON.stringify({ error: 'Token expired' }), { status: 401, headers: corsHeaders })
    }
    if (!payload.sub) throw new Error('No sub')
    userId = payload.sub
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  try {
    const { message, history = [], context = '' } = await req.json()

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400, headers: corsHeaders })
    }

    // Build conversation history for Gemini
    const contents: any[] = []

    // Add previous messages
    for (const msg of history.slice(-10)) { // last 10 messages for context
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }

    // Add current message with optional page context
    const userMessage = context
      ? `[User is on the ${context} page]\n\n${message}`
      : message

    contents.push({ role: 'user', parts: [{ text: userMessage }] })

    const geminiBody = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        // Gemini 3 docs: keep temperature at default 1.0 for best performance
        maxOutputTokens: 512,
      },
    }

    // Try each model until one works
    let geminiRes: Response | null = null
    let lastErr = ''
    for (const model of GEMINI_MODELS) {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`
      geminiRes = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(geminiBody),
      })
      if (geminiRes.ok) break
      lastErr = await geminiRes.text()
      console.warn(`Model ${model} failed (${geminiRes.status}):`, lastErr)
      geminiRes = null
    }

    if (!geminiRes) {
      console.error('All Gemini models failed. Last error:', lastErr)
      let userMsg = 'AI service temporarily unavailable. Please try again.'
      try {
        const errJson = JSON.parse(lastErr)
        const geminiMsg = errJson?.error?.message ?? ''
        if (geminiMsg.includes('API_KEY_INVALID') || geminiMsg.includes('API key')) {
          userMsg = 'AI configuration error. Please contact support.'
        } else if (geminiMsg.includes('quota') || geminiMsg.includes('RESOURCE_EXHAUSTED')) {
          userMsg = 'AI usage limit reached. Please try again in a moment.'
        }
      } catch { /* use default message */ }
      return new Response(
        JSON.stringify({ error: userMsg }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const geminiData = await geminiRes.json()
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response. Please try again.'

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('ai-chat error:', err)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
