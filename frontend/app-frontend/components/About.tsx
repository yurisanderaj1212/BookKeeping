'use client'

import { useTranslations } from 'next-intl'

export default function About() {
  const t = useTranslations('landing.about')

  const stats = [
    { labelKey: 'statsActiveCompanies', value: '10,000+' },
    { labelKey: 'statsTransactions',    value: '2M+' },
    { labelKey: 'statsCountries',       value: '25+' },
    { labelKey: 'statsSatisfaction',    value: '98%' },
  ]

  const values = [
    {
      titleKey: 'valueSimplicityTitle', descKey: 'valueSimplicityDesc',
      icon: <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      titleKey: 'valueTrustTitle', descKey: 'valueTrustDesc',
      icon: <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    },
    {
      titleKey: 'valueCommunityTitle', descKey: 'valueCommunityDesc',
      icon: <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
  ]

  return (
    <div id="about" className="py-24 bg-slate-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-gray-100 sm:text-4xl">{t('title')}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        {/* Mission */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-soft">
            <h3 className="text-2xl font-bold text-navy-800 dark:text-gray-100 mb-6 text-center">{t('missionTitle')}</h3>
            <p className="text-lg text-slate-600 dark:text-gray-400 text-center leading-relaxed">{t('missionText')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {stats.map(s => (
              <div key={s.labelKey} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-soft">
                <dt className="text-sm font-medium text-slate-600 dark:text-gray-400">{t(s.labelKey as any)}</dt>
                <dd className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Values */}
        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-navy-800 dark:text-gray-100">{t('valuesTitle')}</h3>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {values.map(v => (
              <div key={v.titleKey} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-soft">
                <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">{v.icon}</div>
                <h4 className="text-lg font-semibold text-navy-800 dark:text-gray-100 mb-2">{t(v.titleKey as any)}</h4>
                <p className="text-slate-600 dark:text-gray-400">{t(v.descKey as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
