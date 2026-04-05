import { getSupabase } from '@/lib/supabaseClient'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  jobTitle: string
  avatarPath?: string
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
  jobTitle?: string
}

// ─── Profile — stored in Supabase auth.users.user_metadata ───────────────────

export async function getProfile(): Promise<UserProfile> {
  const supabase = getSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error(error?.message ?? 'Not authenticated')

  const meta = user.user_metadata ?? {}
  return {
    id:         user.id,
    email:      user.email ?? '',
    firstName:  meta.first_name ?? meta.firstName ?? '',
    lastName:   meta.last_name  ?? meta.lastName  ?? '',
    phone:      meta.phone      ?? '',
    jobTitle:   meta.job_title  ?? meta.jobTitle  ?? '',
    avatarPath: meta.avatar_path ?? null,
  }
}

export async function updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
  const supabase = getSupabase()
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: {
      first_name: dto.firstName,
      last_name:  dto.lastName,
      phone:      dto.phone,
      job_title:  dto.jobTitle,
    }
  })
  if (error || !user) throw new Error(error?.message ?? 'Update failed')

  const meta = user.user_metadata ?? {}
  return {
    id:        user.id,
    email:     user.email ?? '',
    firstName: meta.first_name ?? '',
    lastName:  meta.last_name  ?? '',
    phone:     meta.phone      ?? '',
    jobTitle:  meta.job_title  ?? '',
  }
}

// ─── Avatar — stored in Supabase Storage bucket "avatars" ────────────────────

export async function uploadAvatar(file: File): Promise<string> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw new Error(uploadError.message)

  // Save the path in user_metadata so it persists across sessions
  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatar_path: path }
  })
  if (metaError) throw new Error(metaError.message)

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null
  const supabase = getSupabase()
  const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath)
  return data.publicUrl
}

export async function removeAvatar(): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const avatarPath = user.user_metadata?.avatar_path
  if (avatarPath) {
    await supabase.storage.from('avatars').remove([avatarPath])
  }
  const { error } = await supabase.auth.updateUser({ data: { avatar_path: null } })
  if (error) throw new Error(error.message)
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const supabase = getSupabase()
  // Supabase doesn't require current password for updateUser — it relies on the active session.
  // We re-authenticate first to validate the current password.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not authenticated')

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) throw new Error('invalidCredentials')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

// ─── Local preferences (localStorage, no backend needed) ─────────────────────

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
  sessionTimeout: number
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
  sessionTimeout: 30,
  notifications: {
    emailNotifications: true,
    transactionAlerts: true,
    reportReminders: true,
    weeklyDigest: false,
    monthlyReports: true,
    lowBalanceAlerts: true,
    expenseThresholds: false,
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
