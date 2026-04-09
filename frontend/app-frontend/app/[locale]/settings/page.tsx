'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useRouter as useIntlRouter, usePathname as useIntlPathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  PlayCircle,
  CreditCard
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAvatarUrl,
  removeAvatar,
  changePassword,
  getLocalPreferences,
  saveLocalPreferences,
  type LocalPreferences
} from '@/services/userService'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'
import PageLayout from '@/components/ui/PageLayout'
import MobileMenuButton from '@/components/ui/MobileMenuButton'
import ThemeToggle from '@/components/ui/ThemeToggle'

// ─── BillingRedirect ─────────────────────────────────────────────────────────
// Componente separado para que el useEffect no viole las reglas de hooks
function BillingRedirect() {
  const router = useRouter()
  const t = useTranslations('settings')
  useEffect(() => { router.push('/settings/billing') }, [router])
  return (
    <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400 text-sm">
      {t('redirectingBilling')}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SecurityForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  showCurrent: boolean
  showNew: boolean
  showConfirm: boolean
  twoFactorAuth: boolean
  sessionTimeout: number
  loginAlerts: boolean
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

const ProfileTab = ({
  firstName, setFirstName,
  lastName, setLastName,
  email,
  phone, setPhone,
  jobTitle, setJobTitle,
  avatarUrl, onAvatarChange, onAvatarRemove,
  isLoading, onSave
}: {
  firstName: string; setFirstName: (v: string) => void
  lastName: string; setLastName: (v: string) => void
  email: string
  phone: string; setPhone: (v: string) => void
  jobTitle: string; setJobTitle: (v: string) => void
  avatarUrl: string | null; onAvatarChange: (file: File) => void; onAvatarRemove: () => void
  isLoading: boolean; onSave: () => void
}) => {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('personalInfo')}</h3>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary-100"
            />
          ) : (
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors shadow-md"
            title={t('changePhoto')}
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) onAvatarChange(file)
              e.target.value = ''
            }}
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{firstName} {lastName}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{jobTitle || t('noPosition')}</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              {t('changePhoto')}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={onAvatarRemove}
                className="text-xs text-red-500 hover:text-red-600"
              >
                {t('removePhoto')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('firstName')}</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('lastName')}</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="email" value={email} readOnly
              className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('emailReadOnly')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="(555) 123-4567" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('jobTitle')}</label>
          <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={t('jobTitlePlaceholder')} />
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button onClick={onSave} disabled={isLoading}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
        <Save className="w-4 h-4" />
        <span>{isLoading ? tCommon('saving') : tCommon('save')}</span>
      </button>
    </div>
  </div>
  )
}

// ─── Company Tab ─────────────────────────────────────────────────────────────

const CompanyTab = ({
  prefs, setPrefs, isLoading, onSave
}: {
  prefs: LocalPreferences
  setPrefs: (p: LocalPreferences) => void
  isLoading: boolean
  onSave: () => void
}) => {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  return (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('companyInfo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('companyName')}</label>
          <input type="text" value={prefs.companyName}
            onChange={e => setPrefs({ ...prefs, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('businessType')}</label>
          <select value={prefs.businessType} onChange={e => setPrefs({ ...prefs, businessType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="Servicios Profesionales">{t('businessTypes.professional')}</option>
            <option value="Retail">{t('businessTypes.retail')}</option>
            <option value="Manufactura">{t('businessTypes.other')}</option>
            <option value="Tecnología">{t('businessTypes.tech')}</option>
            <option value="Consultoría">{t('businessTypes.professional')}</option>
            <option value="Restaurante">{t('businessTypes.restaurant')}</option>
            <option value="Construcción">{t('businessTypes.construction')}</option>
            <option value="Otro">{t('businessTypes.other')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('taxId')}</label>
          <input type="text" value={prefs.taxId} onChange={e => setPrefs({ ...prefs, taxId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="12-3456789" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fiscalYearStart')}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select value={prefs.fiscalYearStart} onChange={e => setPrefs({ ...prefs, fiscalYearStart: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="01-01">{t('fiscalYearOptions.jan')}</option>
              <option value="04-01">{t('fiscalYearOptions.apr')}</option>
              <option value="07-01">{t('fiscalYearOptions.jul')}</option>
              <option value="10-01">{t('fiscalYearOptions.oct')}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('companyPhone')}</label>
          <input type="tel" value={prefs.companyPhone} onChange={e => setPrefs({ ...prefs, companyPhone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('companyEmail')}</label>
          <input type="email" value={prefs.companyEmail} onChange={e => setPrefs({ ...prefs, companyEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('website')}</label>
          <input type="url" value={prefs.companyWebsite} onChange={e => setPrefs({ ...prefs, companyWebsite: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={t('websitePlaceholder')} />
        </div>
      </div>
    </div>
    <div className="flex justify-end">
      <button onClick={onSave} disabled={isLoading}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
        <Save className="w-4 h-4" />
        <span>{isLoading ? tCommon('saving') : tCommon('save')}</span>
      </button>
    </div>
  </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

const SecurityTab = ({
  form, setForm, isLoading, onSave
}: {
  form: SecurityForm
  setForm: (f: SecurityForm) => void
  isLoading: boolean
  onSave: () => void
}) => {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  return (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('changePassword')}</h3>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('currentPassword')}</label>
          <div className="relative">
            <input type={form.showCurrent ? 'text' : 'password'} value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            <button type="button" onClick={() => setForm({ ...form, showCurrent: !form.showCurrent })}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-400">
              {form.showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('newPassword')}</label>
          <div className="relative">
            <input type={form.showNew ? 'text' : 'password'} value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            <button type="button" onClick={() => setForm({ ...form, showNew: !form.showNew })}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-400">
              {form.showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('passwordHint')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmNewPassword')}</label>
          <div className="relative">
            <input type={form.showConfirm ? 'text' : 'password'} value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            <button type="button" onClick={() => setForm({ ...form, showConfirm: !form.showConfirm })}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-400">
              {form.showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{t('passwordsMismatch')}</p>
          )}
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button onClick={onSave} disabled={isLoading || (!!form.newPassword && form.newPassword !== form.confirmPassword)}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
        <Save className="w-4 h-4" />
        <span>{isLoading ? tCommon('saving') : tCommon('save')}</span>
      </button>
    </div>
  </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const intlRouter = useIntlRouter()
  const intlPathname = useIntlPathname()
  const currentLocale = useLocale()
  const { isLoading: authLoading, isAuthenticated, logout } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  const { isOnboardingOpen, currentStep: onboardingStep, setStep: setOnboardingStep, closeOnboarding, completeOnboarding, resetOnboarding } = useOnboarding()
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const tErr = useTranslations('apiErrors')

  // Profile state (from API)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Local preferences (localStorage) — always sync language from current URL locale
  const [prefs, setPrefs] = useState<LocalPreferences>(() => getLocalPreferences())

  // Notifications (subset of prefs)
  const [notifPrefs, setNotifPrefs] = useState(getLocalPreferences().notifications)

  // Security form
  const [secForm, setSecForm] = useState<SecurityForm>({
    currentPassword: '', newPassword: '', confirmPassword: '',
    showCurrent: false, showNew: false, showConfirm: false,
    twoFactorAuth: false, sessionTimeout: 30, loginAlerts: true
  })

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') showSuccess(tCommon('success'), msg)
    else showError(tCommon('error'), msg)
  }, [showSuccess, showError, tCommon])

  // Sync language selector with current URL locale on mount
  useEffect(() => {
    setPrefs(p => ({ ...p, language: currentLocale }))
    saveLocalPreferences({ language: currentLocale })
  }, [currentLocale])

  // Load profile from API on mount
  useEffect(() => {
    if (!isAuthenticated) return
    getProfile().then(p => {
      setFirstName(p.firstName ?? '')
      setLastName(p.lastName ?? '')
      setEmail(p.email ?? '')
      setPhone(p.phone ?? '')
      setJobTitle(p.jobTitle ?? '')
      if (p.avatarPath) setAvatarUrl(getAvatarUrl(p.avatarPath))
    }).catch(() => {/* silencioso */})
  }, [isAuthenticated])

  const handleAvatarChange = useCallback(async (file: File) => {
    setIsLoading(true)
    try {
      const url = await uploadAvatar(file)
      setAvatarUrl(url)
      showToast(t('photoSaved'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      showToast(msg || tCommon('error'), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast, t, tCommon])

  const handleAvatarRemove = useCallback(async () => {
    setIsLoading(true)
    try {
      await removeAvatar()
      setAvatarUrl(null)
      showToast(t('photoRemoved'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      showToast(msg || tCommon('error'), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast, t, tCommon])

  const handleSaveProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      await updateProfile({ firstName, lastName, phone, jobTitle })
      showToast(t('profileSaved'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      showToast(msg || tCommon('error'), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [firstName, lastName, phone, jobTitle, showToast, t, tCommon])

  const handleSaveCompany = useCallback(() => {
    saveLocalPreferences(prefs)
    showToast(t('companySaved'))
  }, [prefs, showToast, t])

  const handleSaveNotifications = useCallback(async () => {
    saveLocalPreferences({ notifications: notifPrefs })
    // Sync weeklyDigest to email_preferences table
    try {
      const { getSupabase } = await import('@/lib/supabaseClient')
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('email_preferences').upsert({
          user_id: user.id,
          weekly_report: notifPrefs.weeklyDigest,
          language: getLocalPreferences().language,
        }, { onConflict: 'user_id' })
      }
    } catch { /* silencioso */ }
    showToast(t('notifSaved'))
  }, [notifPrefs, showToast, t])

  const handleSaveSecurity = useCallback(async () => {
    if (!secForm.currentPassword && !secForm.newPassword) {
      saveLocalPreferences({ sessionTimeout: secForm.sessionTimeout } as Partial<LocalPreferences>)
      showToast(t('securitySaved'))
      return
    }
    if (secForm.newPassword !== secForm.confirmPassword) {
      showToast(t('passwordsMismatch'), 'error')
      return
    }
    setIsLoading(true)
    try {
      await changePassword(secForm.currentPassword, secForm.newPassword)
      setSecForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
      showToast(t('passwordSaved'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      // 'invalidCredentials' is thrown by userService when current password is wrong
      showToast(msg === 'invalidCredentials' ? tErr('invalidCredentials') : (msg || tCommon('error')), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [secForm, showToast, t, tErr])

  const handleSavePreferences = useCallback(async () => {
    saveLocalPreferences(prefs)
    // Sync language to email_preferences for weekly reports
    try {
      const { getSupabase } = await import('@/lib/supabaseClient')
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('email_preferences').upsert({
          user_id: user.id,
          language: prefs.language,
        }, { onConflict: 'user_id' })
      }
    } catch { /* silencioso */ }
    showToast(t('prefSaved'))
    // Navigate to new locale using next-intl router (same as sidebar button)
    if (prefs.language !== currentLocale) {
      intlRouter.replace(intlPathname as any, { locale: prefs.language as 'en' | 'es' })
    }
  }, [prefs, currentLocale, intlRouter, intlPathname, showToast, t])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  const tabs = [
    { id: 'profile',       label: t('profile'),       icon: User },
    { id: 'company',       label: t('company'),        icon: Building2 },
    { id: 'notifications', label: t('notifications'),  icon: Bell },
    { id: 'security',      label: t('security'),       icon: Shield },
    { id: 'preferences',   label: t('preferences'),    icon: Palette },
    { id: 'billing',       label: t('billing'),        icon: CreditCard },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            email={email}
            phone={phone} setPhone={setPhone}
            jobTitle={jobTitle} setJobTitle={setJobTitle}
            avatarUrl={avatarUrl} onAvatarChange={handleAvatarChange} onAvatarRemove={handleAvatarRemove}
            isLoading={isLoading} onSave={handleSaveProfile}
          />
        )
      case 'company':
        return <CompanyTab prefs={prefs} setPrefs={setPrefs} isLoading={isLoading} onSave={handleSaveCompany} />
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('notifPreferences')}</h3>
              <div className="space-y-4">
                {([
                  { key: 'emailNotifications' },
                  { key: 'transactionAlerts' },
                  { key: 'reportReminders' },
                  { key: 'weeklyDigest' },
                  { key: 'monthlyReports' },
                  { key: 'lowBalanceAlerts' },
                  { key: 'expenseThresholds' },
                ] as { key: keyof typeof notifPrefs }[]).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{t(`notifItems.${item.key}` as any)}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(`notifItems.${item.key}Desc` as any)}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifPrefs[item.key]}
                        onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveNotifications}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                <Save className="w-4 h-4" /><span>{tCommon('save')}</span>
              </button>
            </div>
          </div>
        )
      case 'security':
        return <SecurityTab form={secForm} setForm={setSecForm} isLoading={isLoading} onSave={handleSaveSecurity} />
      case 'billing':
        // Navegar a la página dedicada — nunca llamar router.push() durante el render
        return <BillingRedirect />
      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('systemPreferences')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('language')}</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <select value={prefs.language} onChange={e => setPrefs({ ...prefs, language: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="es">{t('languageEs')}</option>
                      <option value="en">{t('languageEn')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('themeTitle')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('themeDescription')}</p>
              <ThemeToggle />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dataManagement')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('exportData')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('exportDataDesc')}</p>
                  </div>
                  <button disabled title={t('exportComingSoon')}
                    className="bg-blue-300 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2 opacity-60">
                    <Download className="w-4 h-4" /><span>{t('exportComingSoon')}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">{t('deleteAccount')}</h4>
                    <p className="text-sm text-red-600 mt-1">{t('deleteComingSoon')}</p>
                  </div>
                  <button disabled title={t('deleteComingSoon')}
                    className="bg-red-300 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2 opacity-60">
                    <Trash2 className="w-4 h-4" /><span>{tCommon('delete')}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSavePreferences}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                <Save className="w-4 h-4" /><span>{tCommon('save')}</span>
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar onLogout={logout} />

      <PageLayout>
        {/* Header compacto */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-14 py-2 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{t('title')}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t('subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Signal dashboard to open tour on next mount
                  localStorage.removeItem('cn-onboarding-completed')
                  localStorage.setItem('cn-onboarding-step', '0')
                  router.push('/dashboard')
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-400 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Tour</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" data-tour="settings-main">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Tabs Navigation — 2-col grid on mobile, vertical on desktop */}
            <div className="lg:w-56 shrink-0">
              <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-1.5 lg:gap-1">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left lg:w-full border ${
                        activeTab === tab.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 border-transparent bg-transparent'
                      }`}>
                      <Icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span className="font-medium text-xs sm:text-sm truncate text-inherit">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-w-0">{renderTabContent()}</div>
          </div>
        </div>
      </PageLayout>

      <OnboardingTour isOpen={isOnboardingOpen} onClose={closeOnboarding} onComplete={completeOnboarding} currentStep={onboardingStep} setStep={setOnboardingStep} />
    </div>
  )
}
