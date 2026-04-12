'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CTA() {
  const t = useTranslations('landing')

  return (
    <>
      {/* CTA Section */}
      <section className="py-32 bg-[#81ecff] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2
            className="text-4xl md:text-5xl font-bold text-[#003d47] mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('cta.title')}
          </h2>
          <p className="text-[#005762]/80 text-xl mb-12 max-w-2xl mx-auto font-light">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-[#0c0e12] text-[#81ecff] px-12 py-5 rounded-xl font-black text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            {t('cta.btn')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0c0e12] border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#81ecff] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(129,236,255,0.4)]">
                <span className="text-[#005762] font-black text-xs">CN</span>
              </div>
              <span
                className="text-lg font-bold text-white uppercase tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Chill Numbers
              </span>
            </div>

            {/* Links */}
            <div className="flex gap-8">
              <Link href="/privacy" className="text-white/40 hover:text-[#81ecff] transition-colors text-sm uppercase tracking-widest font-medium">
                {t('footer.privacy')}
              </Link>
              <Link href="/terms" className="text-white/40 hover:text-[#81ecff] transition-colors text-sm uppercase tracking-widest font-medium">
                {t('footer.terms')}
              </Link>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-white/25 text-xs uppercase tracking-widest">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
