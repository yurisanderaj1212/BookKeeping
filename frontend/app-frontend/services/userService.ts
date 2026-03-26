import { apiClient } from '@/lib/apiClient'

export interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  jobTitle: string
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
  jobTitle?: string
}

export async function getProfile(): Promise<UserProfile> {
  return apiClient('/users/profile')
}

export async function updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
  return apiClient('/users/profile', { method: 'PUT', body: JSON.stringify(dto) })
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return apiClient('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  })
}

// ─── Preferencias locales (localStorage, sin backend) ───────────────────────

const PREFS_KEY = 'bookkeeping_preferences'

export interface LocalPreferences {
  language: string
  currency: string
  dateFormat: string
  timezone: string
  companyName: string
  businessType: string
  taxId: string
  fiscalYearStart: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  notifications: {
    emailNotifications: boolean
    transactionAlerts: boolean
    reportReminders: boolean
    weeklyDigest: boolean
    monthlyReports: boolean
    lowBalanceAlerts: boolean
    expenseThresholds: boolean
  }
}

const DEFAULT_PREFS: LocalPreferences = {
  language: 'es',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timezone: 'America/New_York',
  companyName: '',
  businessType: 'Servicios Profesionales',
  taxId: '',
  fiscalYearStart: '01-01',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  notifications: {
    emailNotifications: true,
    transactionAlerts: true,
    reportReminders: true,
    weeklyDigest: false,
    monthlyReports: true,
    lowBalanceAlerts: true,
    expenseThresholds: false
  }
}

export function getLocalPreferences(): LocalPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY)
    if (!stored) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_PREFS
  }
}

export function saveLocalPreferences(prefs: Partial<LocalPreferences>): void {
  const current = getLocalPreferences()
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }))
}
