'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import {
  CreditCard, CheckCircle, AlertCircle, Clock,
  XCircle, ExternalLink, RefreshCw, ArrowLeft
} from 'lucide-react'
import {
  getSubscriptionStatus,
  createPortalSession,
  createCheckoutSession,
  type SubscriptionInfo,
} from '@/lib/subscriptionService'

function StatusBadge({ status, t }: { status: SubscriptionInfo['status']; t: ReturnType<typeof useTranslations> }) {
  const map: Record<SubscriptionInfo['status'], { labelKey: string; className: string; icon: React.ReactNode }> = {
    Trial:    { labelKey: 'statusTrial',    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',   icon: <Clock className="w-3 h-3" /> },
    Active:   { labelKey: 'statusActive',   className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
    PastDue:  { labelKey: 'statusPastDue',  className: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <AlertCircle className="w-3 h-3" /> },
    Canceled: { labelKey: 'statusCanceled', className: 'bg-red-500/20 text-red-400 border-red-500/30',       icon: <XCircle className="w-3 h-3" /> },
    Expired:  { labelKey: 'statusExpired',  className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <XCircle className="w-3 h-3" /> },
  }
  const { labelKey, className, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      {icon}{t(labelKey as Parameters<typeof t>[0])}
    </span>
  )
}

export default function BillingPage() {
  const router = useRouter()
  const t = useTranslations('billing')
  const locale = useLocale()
  const [info, setInfo]         = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading]   = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError]       = useState<string | null>(null)

  function planLabel(plan: SubscriptionInfo['plan']): string {
    if (plan === 'Monthly') return t('planMonthly')
    if (plan === 'Annual') return t('planAnnual')
    return t('planTrial')
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '—'
    const loc = locale === 'en' ? 'en-US' : 'es-ES'
    return new Date(iso).toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setInfo(await getSubscriptionStatus())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  async function openPortal() {
    setError(null)
    setPortalLoading(true)
    try {
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('portalError'))
      setPortalLoading(false)
    }
  }

  async function handleUpgrade(plan: 'monthly' | 'annual') {
    setError(null)
    setUpgradeLoading(plan)
    try {
      const { url } = await createCheckoutSession(plan)
      window.location.href = url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('checkoutError'))
      setUpgradeLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('title')}</h1>
            <p className="text-slate-400 text-sm">{t('subtitle')}</p>
          </div>
          <button onClick={load} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors" title={t('refresh')}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {loading && !info ? (
          <div className="bg-white dark:bg-gray-900/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">
            {t('loading')}
          </div>
        ) : info ? (
          <div className="space-y-4">
            {/* Current plan card */}
            <div className="bg-white dark:bg-gray-900/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('currentPlan')}</p>
                  <p className="text-lg font-semibold">{planLabel(info.plan)}</p>
                </div>
                <StatusBadge status={info.status} t={t} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {info.status === 'Trial' && (
                  <>
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">{t('trialEnds')}</p>
                      <p className="font-medium">{formatDate(info.trialEndsAt)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">{t('daysRemaining')}</p>
                      <p className="font-medium">{t('daysCount', { count: String(info.trialDaysRemaining) })}</p>
                    </div>
                  </>
                )}
                {(info.status === 'Active' || info.status === 'PastDue') && (
                  <>
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">{t('nextRenewal')}</p>
                      <p className="font-medium">{formatDate(info.currentPeriodEnd)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">{t('paymentStatus')}</p>
                      <p className="font-medium">{info.status === 'PastDue' ? t('paymentPending') : t('paymentUpToDate')}</p>
                    </div>
                  </>
                )}
                {info.status === 'Canceled' && (
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">{t('canceledOn')}</p>
                    <p className="font-medium">{formatDate(info.canceledAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Manage subscription */}
            {(info.status === 'Active' || info.status === 'PastDue') && info.stripeCustomerId && (
              <div className="bg-white dark:bg-gray-900/5 border border-white/10 rounded-2xl p-6">
                <p className="text-sm font-semibold mb-1">{t('manageTitle')}</p>
                <p className="text-slate-400 text-xs mb-4">{t('manageDesc')}</p>
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {portalLoading ? t('openingPortal') : t('openPortal')}
                </button>
              </div>
            )}

            {/* Upgrade / activate */}
            {(info.status === 'Trial' || info.status === 'Expired' || info.status === 'Canceled') && (
              <div className="bg-white dark:bg-gray-900/5 border border-white/10 rounded-2xl p-6">
                <p className="text-sm font-semibold mb-1">{t('activateTitle')}</p>
                <p className="text-slate-400 text-xs mb-4">{t('activateDesc')}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleUpgrade('monthly')}
                    disabled={upgradeLoading !== null}
                    className="flex-1 bg-white dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  >
                    {upgradeLoading === 'monthly' ? t('redirecting') : t('planMonthlyBtn')}
                  </button>
                  <button
                    onClick={() => handleUpgrade('annual')}
                    disabled={upgradeLoading !== null}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  >
                    {upgradeLoading === 'annual' ? t('redirecting') : t('planAnnualBtn')}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-slate-600 text-xs pt-2">
              {t('poweredByStripe')}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

