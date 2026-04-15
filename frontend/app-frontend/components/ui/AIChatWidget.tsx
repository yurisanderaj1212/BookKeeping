'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2, Bot, User, Minimize2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabaseClient'
import { usePathname } from 'next/navigation'

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
  ts:      number
}

function getPageContext(pathname: string): string {
  if (pathname.includes('/dashboard'))    return 'Dashboard'
  if (pathname.includes('/transactions')) return 'Transactions'
  if (pathname.includes('/accounts'))     return 'Accounts'
  if (pathname.includes('/reports'))      return 'Reports'
  if (pathname.includes('/analytics'))    return 'Analytics'
  if (pathname.includes('/employees'))    return 'Employees'
  if (pathname.includes('/notifications'))return 'Notifications'
  if (pathname.includes('/settings'))     return 'Settings'
  return 'Chill Numbers'
}

const WELCOME = "Hi! I'm your Chill Numbers assistant. Ask me anything about the app or your finances — I'm here to help! 💡"

// ── Chill Numbers mascot — wallet with eyes and feet ─────────────────────────
function WalletMascot({ size = 32, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animate ? 'mascot-bounce' : ''}
    >
      {/* Body — wallet */}
      <rect x="6" y="18" width="52" height="34" rx="8" fill="#20b2aa" />
      {/* Wallet flap */}
      <rect x="6" y="18" width="52" height="14" rx="8" fill="#1a9b94" />
      {/* Coin slot */}
      <rect x="38" y="28" width="16" height="10" rx="5" fill="#0d7a73" />
      <circle cx="46" cy="33" r="3" fill="#f4ffc6" />
      {/* Left eye */}
      <circle cx="22" cy="30" r="5" fill="white" />
      <circle cx="23" cy="30" r="2.5" fill="#0d3d3a" />
      <circle cx="24" cy="29" r="0.8" fill="white" />
      {/* Right eye */}
      <circle cx="36" cy="30" r="5" fill="white" />
      <circle cx="37" cy="30" r="2.5" fill="#0d3d3a" />
      <circle cx="38" cy="29" r="0.8" fill="white" />
      {/* Smile */}
      <path d="M24 38 Q29 43 36 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Left foot */}
      <ellipse cx="20" cy="54" rx="7" ry="4" fill="#1a9b94" />
      <ellipse cx="17" cy="55" rx="3" ry="2" fill="#0d7a73" />
      {/* Right foot */}
      <ellipse cx="44" cy="54" rx="7" ry="4" fill="#1a9b94" />
      <ellipse cx="47" cy="55" rx="3" ry="2" fill="#0d7a73" />
    </svg>
  )
}

export default function AIChatWidget() {
  const pathname = usePathname()
  const [open, setOpen]           = useState(false)
  const [minimized, setMin]       = useState(false)
  const [showGreeting, setGreeting] = useState(false)
  const [messages, setMessages]   = useState<Message[]>([
    { id: '0', role: 'assistant', content: WELCOME, ts: Date.now() },
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Show greeting bubble after 2s on mount
  useEffect(() => {
    const t = setTimeout(() => setGreeting(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Hide greeting when chat opens
  useEffect(() => {
    if (open) setGreeting(false)
  }, [open])

  // Scroll to bottom on new message
  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, minimized])

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const { error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error('Session expired')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // Build history (exclude welcome message)
      const history = messages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey':        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            message: text,
            history,
            context: getPageContext(pathname),
          }),
        },
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error getting response')

      const aiMsg: Message = {
        id:      (Date.now() + 1).toString(),
        role:    'assistant',
        content: data.reply,
        ts:      Date.now(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, pathname])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const unreadCount = 0 // could track unread if needed

  return (
    <>
      {/* Floating button with mascot */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Greeting bubble */}
          {showGreeting && (
            <div
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg max-w-[200px] text-sm text-gray-700 dark:text-gray-200 animate-fade-in"
              style={{ animation: 'fadeInUp 0.4s ease-out' }}
            >
              👋 Hi! Need help with Chill Numbers?
              <button
                onClick={() => setGreeting(false)}
                className="ml-2 text-gray-400 hover:text-gray-600 text-xs"
              >✕</button>
            </div>
          )}

          {/* Mascot button */}
          <button
            onClick={() => { setOpen(true); setMin(false) }}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-500 hover:bg-primary-600 shadow-xl transition-all duration-300 hover:scale-110 relative"
            aria-label="Open AI assistant"
            style={{ padding: '6px' }}
          >
            <WalletMascot size={44} animate />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f4ffc6] rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f4ffc6] rounded-full" />
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
            minimized ? 'h-14' : 'h-[520px]'
          }`}
          style={{ maxWidth: 'calc(100vw - 24px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-500 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <WalletMascot size={36} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Chill Numbers AI</p>
                <p className="text-white/70 text-[10px]">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMin(m => !m)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-primary-100 dark:bg-primary-900/30'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {msg.role === 'assistant'
                        ? <Bot className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                        : <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      }
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'assistant'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                          : 'bg-primary-500 text-white rounded-tr-sm'
                      }`}
                      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none disabled:opacity-50"
                    style={{ WebkitTextFillColor: 'inherit' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
                  >
                    {loading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 dark:text-gray-600 text-center mt-1.5">
                  Powered by Gemini AI · Chill Numbers assistant
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
