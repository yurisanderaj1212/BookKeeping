'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LandingNav from '@/components/LandingNav'
import AuthFlipCard from '@/components/auth/AuthFlipCard'

export default function Hero() {
  const t  = useTranslations('landing')

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen bg-[#0c0e12] overflow-hidden">

      {/* Background mesh gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#81ecff]/8 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#bf81ff]/8 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
      </div>

      <LandingNav />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="w-10 h-px bg-[#81ecff]" />
              <span className="text-[#81ecff] text-xs font-bold tracking-[0.3em] uppercase">Chill Numbers</span>
            </div>

            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t('hero.title')}
              <br />
              <span className="bg-linear-to-r from-[#81ecff] via-[#bf81ff] to-[#81ecff] bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-lg leading-relaxed font-light">
              {t('hero.subtitle')}
            </p>

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

            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-2">
                {['#81ecff', '#bf81ff', '#f4ffc6', '#81ecff'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: c + '33', borderColor: c + '66' }}
                  />
                ))}
              </div>
              <p className="text-white/40 text-sm">
                <span className="text-white/70 font-semibold">+2,000</span> businesses trust us
              </p>
            </div>
          </div>

          {/* Right — flip card */}
          <div className="hidden lg:flex justify-center relative">
            <div className="absolute -z-10 w-96 h-96 bg-[#81ecff]/8 blur-[100px] rounded-full" />
            <AuthFlipCard />
          </div>
        </div>
      </div>
    </div>
  )
}
