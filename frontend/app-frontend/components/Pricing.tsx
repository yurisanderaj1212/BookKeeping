'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Pricing() {
  const t = useTranslations('landing.pricing')

  const plans = [
    {
      nameKey: 'freePlanName', descKey: 'freePlanDesc', highlightKey: 'freePlanHighlight',
      price: '$0', periodKey: 'perMonth',
      featureKeys: ['featureDashboard','featureManualTx','featureBasicReports','featureLimit','featureEmailSupport'],
      ctaKey: 'ctaFree', ctaLink: '/auth/register', popular: false,
    },
    {
      nameKey: 'annualPlanName', descKey: 'annualPlanDesc', highlightKey: 'annualPlanHighlight',
      price: '$99.99', periodKey: 'perYear',
      featureKeys: ['featureEverythingFree','featureUnlimitedTx','featurePlaid','featureAdvancedAnalytics','featureWeeklyClose','featureTeam','featurePrioritySupport','featureBackups','featureCustomCategories','featureEmailReports','featureMultiplatform'],
      ctaKey: 'ctaAnnual', ctaLink: '/auth/register', popular: true,
    },
    {
      nameKey: 'monthlyPlanName', descKey: 'monthlyPlanDesc', highlightKey: 'monthlyPlanHighlight',
      price: '$9.99', periodKey: 'perMonth',
      featureKeys: ['featureEverythingFree','featureUnlimitedTx','featurePlaid','featureAdvancedAnalytics','featureWeeklyClose','featureTeam','featurePrioritySupport','featureBackups','featureCustomCategories'],
      ctaKey: 'ctaMonthly', ctaLink: '/auth/register', popular: false,
    },
  ]

  return (
    <div id="pricing" className="py-24 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-gray-100 sm:text-4xl">{t('title')}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-6xl lg:grid-cols-3">
          {plans.map(plan => (
            <div key={plan.nameKey} className={`${
              plan.popular
                ? 'relative bg-linear-to-br from-primary-400 via-primary-500 to-cyan-500 text-white shadow-strong ring-2 ring-primary-400 lg:z-10 scale-105'
                : 'bg-white dark:bg-gray-900 shadow-soft'
            } rounded-3xl p-8 lg:mx-0 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-16`}>
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-24 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 px-3 py-2 text-sm font-medium text-white text-center shadow-lg">
                  {t('popular')}
                </div>
              )}
              <div className="mx-auto max-w-xs lg:mx-0 lg:flex-auto">
                <h3 className={`text-2xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-navy-800 dark:text-gray-100'}`}>
                  {t(plan.nameKey as any)}
                </h3>
                <p className={`mt-6 text-base leading-7 ${plan.popular ? 'text-blue-100' : 'text-slate-600 dark:text-gray-400'}`}>
                  {t(plan.descKey as any)}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-5xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-navy-800 dark:text-gray-100'}`}>{plan.price}</span>
                  <span className={`text-sm font-semibold leading-6 ${plan.popular ? 'text-blue-100' : 'text-slate-600 dark:text-gray-400'}`}>{t(plan.periodKey as any)}</span>
                </p>
                <p className={`mt-3 text-sm leading-6 font-medium ${plan.popular ? 'text-cyan-200' : 'text-primary-600 dark:text-primary-400'}`}>
                  {t(plan.highlightKey as any)}
                </p>
                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${plan.popular ? 'text-blue-100' : 'text-slate-600 dark:text-gray-400'}`}>
                  {plan.featureKeys.map(fk => (
                    <li key={fk} className="flex gap-x-3">
                      <svg className={`h-6 w-5 flex-none ${plan.popular ? 'text-cyan-200' : 'text-primary-500 dark:text-primary-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {t(fk as any)}
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaLink} className={`${
                  plan.popular
                    ? 'bg-white text-primary-600 shadow-sm hover:bg-blue-50'
                    : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                } mt-8 block w-full rounded-lg px-3 py-2 text-center text-sm font-semibold transition-all duration-200`}>
                  {t(plan.ctaKey as any)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
