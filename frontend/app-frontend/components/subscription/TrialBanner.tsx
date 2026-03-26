'use client'

import Link from 'next/link'
import { Clock, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { SubscriptionInfo } from '@/lib/subscriptionService'

interface Props {
  info: SubscriptionInfo
}

export default function TrialBanner({ info }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const t = useTranslations('subscription')
  const tCommon = useTranslations('common')

  // Only show during trial with remaining days
  if (dismissed || info.status !== 'Trial' || info.trialDaysRemaining <= 0) return null

  const urgent = info.trialDaysRemaining <= 5
  const days = info.trialDaysRemaining
  const dayWord = days === 1 ? t('trialDay') : t('trialDays')

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
        urgent
          ? 'bg-amber-500/15 border-b border-amber-500/30 text-amber-300'
          : 'bg-blue-500/10 border-b border-blue-500/20 text-blue-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 shrink-0" />
        <span>
          {urgent
            ? `⚠️ ${t('trialExpiresSoon')} ${days} ${dayWord}.`
            : `${t('trialRemaining')} ${days} ${t('trialRemainingDays')}`}
          {' '}
          <Link href="/subscribe" className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity">
            {t('subscribe')}
          </Link>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label={tCommon('close')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
