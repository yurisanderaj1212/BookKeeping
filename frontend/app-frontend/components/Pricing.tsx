'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

const PLANS = [
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

export default function Pricing() {
  const t = useTranslations('landing.pricing')

  return (
    <section id="pricing" className="py-32 bg-[#0c0e12] relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#81ecff]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#bf81ff]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('title')}
          </h2>
          <p className="text-white/50 text-lg">{t('subtitle')}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`relative flex flex-col gap-6 rounded-3xl p-8 transition-all duration-500 ${
                plan.popular ? 'lg:scale-105 lg:-my-4' : ''
              }`}
              style={
                plan.popular
                  ? {
                      background: 'rgba(23, 26, 31, 0.9)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(129,236,255,0.3)',
                      boxShadow: '0 0 80px rgba(129,236,255,0.12)',
                    }
                  : {
                      background: 'rgba(17, 19, 24, 0.8)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#81ecff] to-[#bf81ff] text-[#0c0e12] text-[11px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.2em] whitespace-nowrap">
                  {t('popular')}
                </div>
              )}

              {/* Plan name & desc */}
              <div>
                <h3
                  className="text-xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t(plan.nameKey as any)}
                </h3>
                <p className="text-white/40 text-sm">{t(plan.descKey as any)}</p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-bold ${plan.popular ? 'text-[#81ecff]' : 'text-white'}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-white/40 text-xs uppercase tracking-widest font-bold">
                    {t(plan.periodKey as any)}
                  </span>
                </div>
                <p className={`text-xs font-bold mt-1 uppercase tracking-widest ${plan.popular ? 'text-[#f4ffc6]' : 'text-white/30'}`}>
                  {t(plan.highlightKey as any)}
                </p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 py-6 border-t border-white/5">
                {plan.featureKeys.map((fk) => (
                  <li key={fk} className="flex items-center gap-3 text-sm text-white/60">
                    <svg
                      className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-[#81ecff]' : 'text-white/30'}`}
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(fk as any)}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaLink}
                className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all duration-300 uppercase tracking-widest ${
                  plan.popular
                    ? 'bg-[#81ecff] text-[#005762] hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] hover:scale-[1.02]'
                    : 'border border-white/10 text-white/70 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                {t(plan.ctaKey as any)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
