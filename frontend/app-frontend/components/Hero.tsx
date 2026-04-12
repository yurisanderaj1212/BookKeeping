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

          {/* Right — floating glass card */}
          <div className="hidden lg:flex justify-center relative">
            {/* Ambient glow behind card */}
            <div className="absolute -z-10 w-80 h-80 bg-[#bf81ff]/10 blur-[80px] rounded-full" />

            <div className="w-80 rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden"
              style={{
                background: 'rgba(23, 26, 31, 0.6)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                animation: 'float 6s ease-in-out infinite',
              }}>

              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-[#81ecff]/5 to-[#bf81ff]/5 pointer-events-none" />

              {/* Balance display */}
              <div className="relative z-10 flex flex-col items-center gap-2 pt-4">
                <div className="w-16 h-16 rounded-2xl bg-[#81ecff]/10 flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-[#81ecff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-[#81ecff] text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  $42,890.00
                </p>
                <p className="text-white/40 text-xs uppercase tracking-widest">Available Capital</p>
              </div>

              {/* Animated bar chart */}
              <div className="relative z-10 flex items-end justify-between h-28 gap-2 px-2">
                {[
                  { h: '40%', color: '#81ecff', delay: '0s',    label: 'MON' },
                  { h: '75%', color: '#bf81ff', delay: '0.5s',  label: 'TUE' },
                  { h: '55%', color: '#81ecff', delay: '1.2s',  label: 'WED' },
                  { h: '90%', color: '#f4ffc6', delay: '1.8s',  label: 'THU' },
                  { h: '65%', color: '#81ecff', delay: '2.3s',  label: 'FRI' },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full rounded-t-sm relative overflow-hidden"
                      style={{
                        height: bar.h,
              background: `linear-gradient(to top, ${bar.color}20, ${bar.color})`,
                        boxShadow: `0 0 12px ${bar.color}40`,
                        animation: `barPulse 3s ease-in-out infinite`,
                        animationDelay: bar.delay,
                      }} />
                    <span className="text-[9px] text-white/30 font-bold tracking-wider">{bar.label}</span>
                  </div>
                ))}
              </div>

              {/* Revenue growth stat */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Revenue Growth</p>
                  <p className="text-white font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    +24.8% <span className="text-emerald-400 text-sm font-normal">vs last quarter</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#81ecff]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#81ecff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              {/* Light streak decorations */}
              <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-1/3 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-16px); }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
