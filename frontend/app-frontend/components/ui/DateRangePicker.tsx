'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DateRangePickerProps {
  startDate: string | null   // YYYY-MM-DD or null
  endDate:   string | null
  onChange:  (start: string | null, end: string | null) => void
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function displayDate(s: string | null, locale: string): string {
  if (!s) return ''
  const d = parseDate(s)
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const t = useTranslations('transactions')
  const now = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const handleDayClick = (day: number) => {
    const d = fmt(new Date(viewYear, viewMonth, day))
    if (selecting === 'start' || !startDate) {
      onChange(d, null)
      setSelecting('end')
    } else {
      // If clicked before start, swap
      if (d < startDate) {
        onChange(d, startDate)
      } else {
        onChange(startDate, d)
      }
      setSelecting('start')
      setOpen(false)
    }
  }

  const isInRange = (day: number): boolean => {
    const d = fmt(new Date(viewYear, viewMonth, day))
    const end = endDate ?? hoverDate
    if (!startDate || !end) return false
    const [s, e] = startDate <= end ? [startDate, end] : [end, startDate]
    return d > s && d < e
  }

  const isStart = (day: number) => fmt(new Date(viewYear, viewMonth, day)) === startDate
  const isEnd   = (day: number) => fmt(new Date(viewYear, viewMonth, day)) === endDate

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null, null)
    setSelecting('start')
  }

  const hasSelection = startDate || endDate

  const label = startDate && endDate
    ? `${displayDate(startDate, 'en')} – ${displayDate(endDate, 'en')}`
    : startDate
    ? `${displayDate(startDate, 'en')} – ...`
    : t('allDates')

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
          hasSelection
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-400'
        }`}
      >
        <Calendar className="w-4 h-4 shrink-0" />
        <span className="truncate max-w-[160px]">{label}</span>
        {hasSelection && (
          <X
            className="w-3.5 h-3.5 shrink-0 opacity-60 hover:opacity-100"
            onClick={clearDates}
          />
        )}
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 w-72"
          style={{ minWidth: '280px' }}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const inRange = isInRange(day)
              const isS = isStart(day)
              const isE = isEnd(day)
              const isToday = fmt(new Date(viewYear, viewMonth, day)) === fmt(now)
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => {
                    if (selecting === 'end' && startDate) {
                      setHoverDate(fmt(new Date(viewYear, viewMonth, day)))
                    }
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`
                    relative h-8 w-full text-xs font-medium transition-all duration-100
                    ${isS || isE
                      ? 'bg-primary-500 text-white rounded-lg z-10'
                      : inRange
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-none'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg'
                    }
                    ${isToday && !isS && !isE ? 'font-bold underline decoration-primary-500' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Hint */}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
            {selecting === 'start' ? 'Select start date' : 'Select end date'}
          </p>

          {/* Quick presets */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {[
              { labelKey: 'thisWeek',  fn: () => {
                const sun = new Date(now); sun.setDate(now.getDate() - now.getDay())
                const sat = new Date(sun); sat.setDate(sun.getDate() + 6)
                onChange(fmt(sun), fmt(sat)); setOpen(false)
              }},
              { labelKey: 'thisMonth', fn: () => {
                const s = new Date(now.getFullYear(), now.getMonth(), 1)
                const e = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                onChange(fmt(s), fmt(e)); setOpen(false)
              }},
              { labelKey: 'thisYear',  fn: () => {
                onChange(`${now.getFullYear()}-01-01`, `${now.getFullYear()}-12-31`); setOpen(false)
              }},
            ].map(p => (
              <button
                key={p.labelKey}
                onClick={p.fn}
                className="text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t(p.labelKey as any)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
