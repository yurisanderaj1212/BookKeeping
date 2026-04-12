'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LandingNav from '@/components/LandingNav'

export default function Hero() {
  const t  = useTranslations('landing')
  const tn = useTranslations('landing.nav')

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen bg-[#0c0e12] overflow-hidden">

      {/* ── Background mesh gradients ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#81ecff]/8 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#bf81ff]/8 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#81ecff]/3 rounded-full blur-[100px]" />
      </div>

      {/* ── Navigation ── */}
      <LandingNav />

      {/* ── Hero content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="w-10 h-px bg-[#81ecff]" />
              <span className="text-[#81ecff] text-xs font-bold tracking-[0.3em] uppercase">
                Chill Numbers
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t('hero.title')}
              <br />
              <span className="bg-linear-to-r from-[#81ecff] via-[#bf81ff] to-[#81ecff] bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/60 max-w-lg leading-relaxed font-light">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                href="/auth/register"
                className="bg-[#81ecff] text-[#005762] px-10 py-4 rounded-lg font-bold text-base shadow-[0_0_40px_rgba(129,236,255,0.2)] hover:shadow-[0_0_60px_rgba(129,236,255,0.4)] hover:scale-105 transition-all duration-300"
              >
                {t('hero.cta')}
              </Link>
              <button
                onClick={() => scrollTo('features')}
                className="group flex items-center gap-2 border border-white/10 text-white/80 px-10 py-4 rounded-lg font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                {t('hero.learnMore')}
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-2">
                {['#81ecff', '#bf81ff', '#f4ffc6', '#81ecff'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c0e12]"
                    style={{ backgroundColor: c + '33', borderColor: c + '66' }} />
                ))}
              </div>
              <p className="text-white/40 text-sm">
                <span className="text-white/70 font-semibold">+2,000</span> businesses trust us
              </p>
            </div>
          </div>

          {/* Right — live bar chart */}
          <div className="hidden lg:flex justify-center relative">
            <div className="absolute -z-10 w-96 h-96 bg-[#81ecff]/8 blur-[100px] rounded-full" />

            <div
              className="w-full max-w-md rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'rgba(13, 15, 20, 0.85)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.25em] mb-2">Global Revenue</p>
                  <p
                    className="text-[#81ecff] text-4xl font-bold tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    $1,429,203.00
                  </p>
                </div>
                {/* Live syncing badge */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f4ffc6] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f4ffc6]" />
                  </span>
                  <span className="text-[#f4ffc6] text-[10px] font-bold uppercase tracking-[0.2em]">Live Syncing</span>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end justify-between gap-3 h-48">
                {[
                  { label: 'MON', pct: 28,  active: false },
                  { label: 'TUE', pct: 45,  active: false },
                  { label: 'WED', pct: 72,  active: false },
                  { label: 'THU', pct: 38,  active: false },
                  { label: 'FRI', pct: 60,  active: false },
                  { label: 'SAT', pct: 100, active: true  },
                  { label: 'SUN', pct: 35,  active: false },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full rounded-sm transition-all duration-1000"
                      style={{
                        height: `${bar.pct}%`,
                        background: bar.active
                          ? '#81ecff'
                          : 'rgba(255,255,255,0.08)',
                        boxShadow: bar.active ? '0 0 20px rgba(129,236,255,0.5)' : 'none',
                        animation: `barGrow 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards`,
                        animationDelay: `${i * 0.1}s`,
                        transformOrigin: 'bottom',
                      }}
                    />
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${bar.active ? 'text-[#81ecff]' : 'text-white/25'}`}
                    >
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes barGrow {
          0%   { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
