'use client'

import { useTranslations } from 'next-intl'

const FEATURES = [
  {
    nameKey: 'smartDashboard',
    descKey: 'smartDashboardDesc',
    accent: '#81ecff',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    nameKey: 'easyTransactions',
    descKey: 'easyTransactionsDesc',
    accent: '#bf81ff',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    nameKey: 'teamManagement',
    descKey: 'teamManagementDesc',
    accent: '#f4ffc6',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    nameKey: 'professionalReports',
    descKey: 'professionalReportsDesc',
    accent: '#81ecff',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    nameKey: 'advancedAnalytics',
    descKey: 'advancedAnalyticsDesc',
    accent: '#bf81ff',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    nameKey: 'weeklyClose',
    descKey: 'weeklyCloseDesc',
    accent: '#f4ffc6',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
]

export default function Features() {
  const t = useTranslations('landing.features')

  return (
    <section
      id="features"
      className="py-32 bg-[#111318] border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('title')}
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.nameKey}
              className="group relative p-8 rounded-2xl transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: 'rgba(23, 26, 31, 0.6)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${f.accent}50`
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${f.accent}10`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: f.accent + '15',
                  color: f.accent,
                }}
              >
                {f.icon}
              </div>

              {/* Title */}
              <h4
                className="text-lg font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t(f.nameKey as any)}
              </h4>

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed">
                {t(f.descKey as any)}
              </p>

              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
                style={{ background: `linear-gradient(to right, transparent, ${f.accent}60, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
