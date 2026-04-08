'use client'

import { useState, useRef, useEffect } from 'react'
import { Info, X } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  description: string
  className?: string
}

export default function InfoTooltip({ title, description, className = '' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center transition-colors"
        aria-label="More information"
      >
        <Info className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{title}</p>
            <button onClick={() => setOpen(false)} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  )
}
