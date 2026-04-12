'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe, X, Menu } from 'lucide-react'

export default function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const locale   = useLocale()
  const router   = useRouter()
  const pathname = usePathname()
  const t  = useTranslations('landing')
  const tn = useTranslations('landing.nav')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const switchLocale = () => {
    const next = locale === 'es' ? 'en' : 'es'
    router.replace(pathname as any, { locale: next })
    setMobileOpen(false)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0c0e12]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#81ecff] rounded-md flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(129,236,255,0.4)] group-hover:shadow-[0_0_20px_rgba(129,236,255,0.6)] transition-all duration-300">
            <span className="text-[#005762] font-black text-xs">CN</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif] uppercase">
            Chill Numbers
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('features')}
            className="text-white/70 hover:text-[#81ecff] transition-colors duration-200 text-sm font-medium tracking-tight cursor-pointer"
          >
            {tn('features')}
          </button>
          <button
            onClick={() => scrollTo('benefits')}
            className="text-white/70 hover:text-[#81ecff] transition-colors duration-200 text-sm font-medium tracking-tight cursor-pointer"
          >
            {tn('benefits')}
          </button>
          <button
            onClick={() => scrollTo('pricing')}
            className="text-white/70 hover:text-[#81ecff] transition-colors duration-200 text-sm font-medium tracking-tight cursor-pointer"
          >
            {tn('pricing')}
          </button>
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language switcher */}
          <button
            onClick={switchLocale}
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:border-[#81ecff]/40 hover:text-[#81ecff] transition-all duration-200"
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === 'es' ? 'EN' : 'ES'}
          </button>

          {/* Sign in */}
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
          >
            {t('hero.loginBtn')}
          </Link>

          {/* Get started CTA */}
          <Link
            href="/auth/register"
            className="bg-[#81ecff] text-[#005762] px-5 py-2 rounded-lg font-bold text-sm hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] hover:scale-105 transition-all duration-200"
          >
            {tn('getStarted')}
          </Link>
        </div>

        {/* Mobile: language + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={switchLocale}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/20 text-white/70"
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === 'es' ? 'EN' : 'ES'}
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0c0e12]/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-6 py-4 flex flex-col gap-1">
            <button
              onClick={() => scrollTo('features')}
              className="text-left px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-[#81ecff] hover:bg-white/5 transition-colors"
            >
              {tn('features')}
            </button>
            <button
              onClick={() => scrollTo('benefits')}
              className="text-left px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-[#81ecff] hover:bg-white/5 transition-colors"
            >
              {tn('benefits')}
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="text-left px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-[#81ecff] hover:bg-white/5 transition-colors"
            >
              {tn('pricing')}
            </button>

            <div className="border-t border-white/5 my-2" />

            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 rounded-lg text-sm font-semibold text-center border border-white/10 text-white/80 hover:border-[#81ecff]/40 hover:text-[#81ecff] transition-all"
            >
              {t('hero.loginBtn')}
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="bg-[#81ecff] text-[#005762] px-3 py-3 rounded-lg text-sm font-bold text-center hover:shadow-[0_0_20px_rgba(129,236,255,0.3)] transition-all"
            >
              {tn('getStarted')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
