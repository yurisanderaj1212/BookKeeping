'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme, type ThemePreference } from '@/hooks/useTheme'

export default function ThemeToggle() {
  const t = useTranslations('settings')
  const { preference, setTheme } = useTheme()

  const options: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: 'light',  label: t('themeLight'),  icon: <Sun  className="w-4 h-4" /> },
    { value: 'dark',   label: t('themeDark'),   icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: t('themeSystem'), icon: <Monitor className="w-4 h-4" /> },
  ]

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            preference === opt.value
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200'
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
