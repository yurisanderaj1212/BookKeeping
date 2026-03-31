'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/hooks/useAuth'
import {
  Calendar, Lock, Unlock, CheckCircle, AlertCircle,
  Download, Eye, TrendingUp, TrendingDown, DollarSign, ArrowLeft, X
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import {
  getWeekClosures, closeWeek, closeWeekByDefinition, reopenWeek, formatCurrency,
  type WeekClosureData, type WeekClosureSummary
} from '@/services/weekClosureService'
import { exportWeekClose, showExportModal } from '@/services/exportService'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'
import PageLayout from '@/components/ui/PageLayout'

function WeekCloseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading, isAuthenticated, logout } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const t = useTranslations('reports.rptWeekClose')
  const tCommon = useTranslations('common')
  const tMonths = useTranslations('reports.months')

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [selectedYear, setSelectedYear] = useState(
    parseInt(searchParams.get('year') || String(currentYear))
  )
  const [selectedMonth, setSelectedMonth] = useState(
    parseInt(searchParams.get('month') || String(currentMonth))
  )
  const [weeks, setWeeks] = useState<WeekClosureData[]>([])
  const [summary, setSummary] = useState<WeekClosureSummary | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modales
  const [detailsWeek, setDetailsWeek] = useState<WeekClosureData | null>(null)
  const [actionWeek, setActionWeek] = useState<WeekClosureData | null>(null)
  const [actionType, setActionType] = useState<'close' | 'reopen'>('close')
  const [actionNotes, setActionNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') showSuccess(tCommon('success'), msg)
    else showError(tCommon('error'), msg)
  }

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    setError(null)
    try {
      const res = await getWeekClosures(selectedYear, selectedMonth)
      setWeeks(res.weeks)
      setSummary(res.summary)
    } catch (err: any) {
      setError(err.message || t('loadError'))
    } finally {
      setLoadingData(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, fetchData])

  if (!isAuthenticated && !isLoading) return null

  const handleConfirmAction = async () => {
    if (!actionWeek) return
    setActionLoading(true)
    try {
      if (actionType === 'close') {
        if (actionWeek.id < 0) {
          await closeWeekByDefinition(
            actionWeek.weekNumber, actionWeek.year, actionWeek.month,
            actionWeek.startDate, actionWeek.endDate,
            undefined, actionNotes || undefined
          )
        } else {
          await closeWeek(actionWeek.id, undefined, actionNotes || undefined)
        }
        showSuccess(tCommon('success'), t('toastClosed', { n: actionWeek.weekNumber }))
      } else {
        await reopenWeek(actionWeek.id, actionNotes || undefined)
        showSuccess(tCommon('success'), t('toastReopened', { n: actionWeek.weekNumber }))
      }
      setActionWeek(null)
      setActionNotes('')
      await fetchData()
    } catch (err: any) {
      showError(tCommon('error'), err.message || t('toastError'))
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed': return <Lock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <Unlock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'closed': return t('statusClosed')
      case 'pending': return t('statusPending')
      default: return t('statusOpen')
    }
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={logout} />

      <PageLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/reports')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
                  <p className="text-sm text-gray-500 mt-1">{t('pageSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => showExportModal((fmt) => exportWeekClose(selectedYear, selectedMonth, fmt))}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                {tCommon("export")}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filtros */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{tMonths(String(i + 1) as any)}</option>
              ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
          )}

          {/* Tarjetas resumen */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm text-gray-600">{t('summaryIncome')}</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(summary.totalIncome)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600" /></div>
                  <div>
                    <p className="text-sm text-gray-600">{t('summaryExpenses')}</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(summary.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center space-x-3">
                  <div className={`${summary.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-2 rounded-lg`}>
                    <DollarSign className={`w-5 h-5 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('summaryProfit')}</p>
                    <p className={`text-xl font-bold ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      {formatCurrency(summary.netProfit)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-purple-600" /></div>
                  <div>
                    <p className="text-sm text-gray-600">{t('summaryClosures')}</p>
                    <p className="text-lg font-bold text-purple-700">
                      {t('summaryClosed', { closed: summary.closedWeeks, total: summary.totalWeeks })}
                    </p>
                    {summary.pendingWeeks > 0 && (
                      <p className="text-xs text-yellow-600">{t('summaryPending', { count: summary.pendingWeeks })}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de semanas */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('tableTitle', { month: tMonths(String(selectedMonth) as any), year: selectedYear })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{t('tableSubtitle')}</p>
            </div>

            {loadingData ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">{t('tableLoading')}</p>
              </div>
            ) : weeks.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('tableEmpty')}</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('colWeek')}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('colStatus')}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('colTransactions')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('colIncome')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('colExpenses')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('colProfit')}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('colActions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {weeks.map((week) => (
                        <tr key={week.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(week.status)}`}>
                                {getStatusIcon(week.status)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{t('weekLabel', { n: week.weekNumber })}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(week.startDate + 'T00:00:00').toLocaleDateString()} —{' '}
                                  {new Date(week.endDate + 'T00:00:00').toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(week.status)}`}>
                              {getStatusIcon(week.status)}
                              {getStatusText(week.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-medium text-gray-900">{week.transactionCount}</span>
                          </td>
                          <td className="px-4 py-4 text-right text-green-600 font-semibold">{formatCurrency(week.income)}</td>
                          <td className="px-4 py-4 text-right text-red-600 font-semibold">{formatCurrency(week.expenses)}</td>
                          <td className={`px-4 py-4 text-right font-semibold ${week.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {formatCurrency(week.netProfit)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setDetailsWeek(week)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t('titleDetails')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {week.status !== 'closed' ? (
                                <button
                                  onClick={() => { setActionWeek(week); setActionType('close'); setActionNotes('') }}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title={t('titleClose')}
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setActionWeek(week); setActionType('reopen'); setActionNotes('') }}
                                  className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title={t('titleReopen')}
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {weeks.map((week) => (
                    <div key={week.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(week.status)}`}>
                            {getStatusIcon(week.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{t('weekLabel', { n: week.weekNumber })}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(week.startDate + 'T00:00:00').toLocaleDateString()} —{' '}
                              {new Date(week.endDate + 'T00:00:00').toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(week.status)}`}>
                          {getStatusText(week.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">{t('mobileIncome')}</p>
                          <p className="text-sm font-semibold text-green-600">{formatCurrency(week.income)}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">{t('mobileExpenses')}</p>
                          <p className="text-sm font-semibold text-red-600">{formatCurrency(week.expenses)}</p>
                        </div>
                        <div className={`${week.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-2`}>
                          <p className="text-xs text-gray-500">{t('mobileProfit')}</p>
                          <p className={`text-sm font-semibold ${week.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {formatCurrency(week.netProfit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => setDetailsWeek(week)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" /><span>{t('btnDetails')}</span>
                        </button>
                        {week.status !== 'closed' ? (
                          <button
                            onClick={() => { setActionWeek(week); setActionType('close'); setActionNotes('') }}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Lock className="w-4 h-4" /><span>{t('btnClose')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => { setActionWeek(week); setActionType('reopen'); setActionNotes('') }}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            <Unlock className="w-4 h-4" /><span>{t('btnReopen')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">{t('infoTitle')}</h4>
                <p className="text-sm text-blue-800 mb-2">{t('infoBody')}</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>{t('infoOpen')}</strong></li>
                  <li>• <strong>{t('infoClosed')}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Modal — Detalles de semana */}
      {detailsWeek && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('detailsTitle', { n: detailsWeek.weekNumber })}
              </h3>
              <button onClick={() => setDetailsWeek(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('detailsPeriod')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(detailsWeek.startDate + 'T00:00:00').toLocaleDateString()} —{' '}
                    {new Date(detailsWeek.endDate + 'T00:00:00').toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('detailsStatus')}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(detailsWeek.status)}`}>
                    {getStatusIcon(detailsWeek.status)}
                    {getStatusText(detailsWeek.status)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{t('detailsIncome')}</p>
                  <p className="text-sm font-bold text-green-700">{formatCurrency(detailsWeek.income)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{t('detailsExpenses')}</p>
                  <p className="text-sm font-bold text-red-700">{formatCurrency(detailsWeek.expenses)}</p>
                </div>
                <div className={`${detailsWeek.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-3 text-center`}>
                  <p className="text-xs text-gray-500">{t('detailsProfit')}</p>
                  <p className={`text-sm font-bold ${detailsWeek.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {formatCurrency(detailsWeek.netProfit)}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{t('detailsTransactions')}</p>
                <p className="text-lg font-bold text-gray-900">{detailsWeek.transactionCount}</p>
              </div>
              {detailsWeek.status === 'closed' && detailsWeek.closedAt && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{t('detailsClosedAt')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(detailsWeek.closedAt).toLocaleString()}
                    {detailsWeek.closedBy && ` ${t('detailsClosedBy')} ${detailsWeek.closedBy}`}
                  </p>
                </div>
              )}
              {detailsWeek.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{t('detailsNotes')}</p>
                  <p className="text-sm text-gray-700">{detailsWeek.notes}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setDetailsWeek(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('btnCloseModal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionWeek && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'close' ? t('actionTitleClose', { n: actionWeek.weekNumber }) : t('actionTitleReopen', { n: actionWeek.weekNumber })}
              </h3>
              <button onClick={() => setActionWeek(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`rounded-lg p-4 ${actionType === 'close' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-start space-x-3">
                  {actionType === 'close'
                    ? <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                    : <Unlock className="w-5 h-5 text-yellow-600 mt-0.5" />}
                  <div>
                    <p className={`text-sm font-medium ${actionType === 'close' ? 'text-green-800' : 'text-yellow-800'}`}>
                      {actionType === 'close' ? t('actionWarningClose') : t('actionWarningReopen')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('actionPeriod')} {new Date(actionWeek.startDate + 'T00:00:00').toLocaleDateString()} —{' '}
                      {new Date(actionWeek.endDate + 'T00:00:00').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('actionNotesLabel')}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  placeholder={t('actionNotesPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setActionWeek(null)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                  actionType === 'close'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{actionType === 'close' ? t('btnConfirmClose') : t('btnConfirmReopen')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function WeekCloseReportPage() {
  return <Suspense><WeekCloseContent /></Suspense>
}
