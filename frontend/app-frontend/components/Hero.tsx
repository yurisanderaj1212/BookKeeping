'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe, X, Menu } from 'lucide-react'

export default function Hero() {
  const [isScrolled,   setIsScrolled]   = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
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

  // Close mobile menu on resize to desktop
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

  const navLinkClass = `transition-colors duration-300 cursor-pointer text-sm font-medium ${
    isScrolled ? 'text-slate-600 hover:text-primary-500' : 'text-white/90 hover:text-white'
  }`

  return (
    <div className="relative bg-linear-to-br from-blue-900 via-blue-800 to-indigo-800 min-h-screen">

      {/* ── Fixed Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-5 py-4 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base">CN</span>
            </div>
            <span className={`text-lg font-bold transition-colors duration-300 ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}>
              Chill Numbers
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => scrollTo('features')} className={navLinkClass}>{tn('features')}</button>
            <button onClick={() => scrollTo('benefits')} className={navLinkClass}>{tn('benefits')}</button>
            <button onClick={() => scrollTo('pricing')}  className={navLinkClass}>{tn('pricing')}</button>

            <button onClick={switchLocale}
              title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isScrolled
                  ? 'border-gray-300 dark:border-gray-600 text-slate-600 hover:border-primary-400 hover:text-primary-600'
                  : 'border-white/30 text-white/90 hover:border-white hover:text-white'
              }`}>
              <Globe className="w-3.5 h-3.5" />
              {locale === 'es' ? 'EN' : 'ES'}
            </button>

            <Link href="/auth/login"
              className={`px-5 py-2 rounded-lg font-semibold text-sm border transition-all duration-200 ${
                isScrolled
                  ? 'border-primary-500 text-primary-600 hover:bg-primary-50'
                  : 'border-white/60 text-white hover:border-white hover:bg-white dark:bg-gray-900/10'
              }`}>
              {t('hero.loginBtn')}
            </Link>
            <Link href="/auth/register"
              className="bg-primary-500 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors">
              {tn('getStarted')}
            </Link>
          </div>

          {/* Mobile: language + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={switchLocale}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                isScrolled
                  ? 'border-gray-300 dark:border-gray-600 text-slate-600'
                  : 'border-white/40 text-white'
              }`}>
              <Globe className="w-3.5 h-3.5" />
              {locale === 'es' ? 'EN' : 'ES'}
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-slate-700 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:bg-white dark:bg-gray-900/10'
              }`}>
              {mobileOpen
                ? <X className="w-6 h-6" />
                : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown menu ── */}
        {mobileOpen && (
          <div className={`md:hidden border-t transition-all ${
            isScrolled ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-blue-900/95 backdrop-blur-md border-white/10'
          }`}>
            <div className="px-5 py-4 flex flex-col gap-1">
              <button onClick={() => scrollTo('features')}
                className={`text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isScrolled ? 'text-slate-700 hover:bg-gray-50 dark:hover:bg-gray-800' : 'text-white/90 hover:bg-white dark:bg-gray-900/10'
                }`}>
                {tn('features')}
              </button>
              <button onClick={() => scrollTo('benefits')}
                className={`text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isScrolled ? 'text-slate-700 hover:bg-gray-50 dark:hover:bg-gray-800' : 'text-white/90 hover:bg-white dark:bg-gray-900/10'
                }`}>
                {tn('benefits')}
              </button>
              <button onClick={() => scrollTo('pricing')}
                className={`text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isScrolled ? 'text-slate-700 hover:bg-gray-50 dark:hover:bg-gray-800' : 'text-white/90 hover:bg-white dark:bg-gray-900/10'
                }`}>
                {tn('pricing')}
              </button>

              <div className="border-t my-2 border-white/10" />

              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className={`px-3 py-3 rounded-lg text-sm font-semibold text-center border transition-all ${
                  isScrolled
                    ? 'border-primary-500 text-primary-600 hover:bg-primary-50'
                    : 'border-white/40 text-white hover:bg-white dark:bg-gray-900/10'
                }`}>
                {t('hero.loginBtn')}
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                className="bg-primary-500 text-white px-3 py-3 rounded-lg text-sm font-semibold text-center hover:bg-primary-600 transition-colors">
                {tn('getStarted')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <div className="relative px-6 py-32 lg:px-8 flex items-center min-h-screen">
        <div className="mx-auto max-w-4xl text-center w-full">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t('hero.title')}
            <br />
            <span className="text-blue-200">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-8 text-blue-200 max-w-2xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/auth/register"
              className="w-full sm:w-auto bg-primary-500 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-primary-600 rounded-lg transition-all duration-200 text-center">
              {t('hero.cta')}
            </Link>
            <button onClick={() => scrollTo('features')}
              className="w-full sm:w-auto text-base font-semibold leading-6 text-blue-100 hover:text-white transition-colors cursor-pointer py-3.5 px-4 rounded-lg hover:bg-white dark:bg-gray-900/10">
              {t('hero.learnMore')} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
