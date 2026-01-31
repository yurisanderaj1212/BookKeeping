'use client'

// Simplified language hook - Spanish only
// Prepared for future i18n with next-intl
export function useLanguage() {
  return {
    language: 'es' as const,
    // Placeholder function for future next-intl integration
    t: (key: string): string => key
  }
}