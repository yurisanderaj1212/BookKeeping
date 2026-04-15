'use client'

import { useTranslations } from 'next-intl'

const VALUES = [
  {
    titleKey: 'valueSimplicityTitle', descKey: 'valueSimplicityDesc', accent: '#81ecff',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    titleKey: 'valueTrustTitle', descKey: 'valueTrustDesc', accent: '#bf81ff',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    titleKey: 'valueCommunityTitle', descKey: 'valueCommunityDesc', accent: '#f4ffc6',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

export default function About() {
  const t = useTranslations('landing.about')

  return (
    <section id="about" className="py-32 bg-[#111318] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('title')}
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto mb-20">
          <div
            className="p-10 rounded-2xl text-center"
            style={{
              background: 'rgba(23, 26, 31, 0.6)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(129,236,255,0.1)',
              boxShadow: '0 0 60px rgba(129,236,255,0.05)',
            }}
          >
            <h3
              className="text-2xl font-bold text-white mb-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t('missionTitle')}
            </h3>
            <p className="text-white/55 text-lg leading-relaxed">{t('missionText')}</p>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <h3
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('valuesTitle')}
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div
              key={v.titleKey}
              className="group p-8 rounded-2xl transition-all duration-300"
              style={{
                background: 'rgba(23, 26, 31, 0.6)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: v.accent + '15', color: v.accent }}
              >
                {v.icon}
              </div>
              <h4
                className="text-base font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t(v.titleKey as any)}
              </h4>
              <p className="text-white/45 text-sm leading-relaxed">{t(v.descKey as any)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
