'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe } from 'lucide-react'

export default function Hero() {
  const [isScrolled, setIsScrolled] = useState(false)
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

  const switchLocale = () => {
    const next = locale === 'es' ? 'en' : 'es'
    router.replace(pathname as any, { locale: next })
  }

  return (
    <div className="relative bg-linear-to-br from-blue-900 via-blue-800 to-indigo-800 min-h-screen">
      {/* Fixed Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CN</span>
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-navy-800' : 'text-white'
            }`}>
              Chill Numbers
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className={`transition-colors duration-300 cursor-pointer text-sm ${isScrolled ? 'text-slate-600 hover:text-primary-500' : 'text-white/90 hover:text-white'}`}>
              {tn('features')}
            </button>
            <button onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              className={`transition-colors duration-300 cursor-pointer text-sm ${isScrolled ? 'text-slate-600 hover:text-primary-500' : 'text-white/90 hover:text-white'}`}>
              {tn('benefits')}
            </button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className={`transition-colors duration-300 cursor-pointer text-sm ${isScrolled ? 'text-slate-600 hover:text-primary-500' : 'text-white/90 hover:text-white'}`}>
              {tn('pricing')}
            </button>

            {/* Language toggle */}
            <button onClick={switchLocale} title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isScrolled ? 'border-gray-300 text-slate-600 hover:border-primary-400 hover:text-primary-600' : 'border-white/30 text-white/90 hover:border-white hover:text-white'
              }`}>
              <Globe className="w-3.5 h-3.5" />
              {locale === 'es' ? 'EN' : 'ES'}
            </button>

            <Link href="/auth/login"
              className={`px-5 py-2 rounded-lg font-semibold text-sm border transition-all duration-200 ${
                isScrolled ? 'border-primary-500 text-primary-600 hover:bg-primary-50' : 'border-white/60 text-white hover:border-white hover:bg-white/10'
              }`}>
              {t('hero.loginBtn')}
            </Link>
            <Link href="/auth/register" className="bg-primary-500 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors">
              {tn('getStarted')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className={`transition-colors duration-300 ${
              isScrolled ? 'text-slate-600 hover:text-primary-500' : 'text-white/90 hover:text-white'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-32 lg:px-8 flex items-center min-h-screen">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t('hero.title')}
            <br />
            <span className="text-blue-200">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-200 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/register"
              className="bg-primary-500 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-600 rounded-lg transition-all duration-200 hover:shadow-medium">
              {t('hero.cta')}
            </Link>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg font-semibold leading-6 text-blue-100 hover:text-white transition-colors cursor-pointer">
              {t('hero.learnMore')} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  )
}