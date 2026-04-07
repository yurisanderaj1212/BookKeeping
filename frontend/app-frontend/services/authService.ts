import { getSupabase } from '@/lib/supabaseClient'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  const meta = data.user.user_metadata
  return {
    id: data.user.id,
    email: data.user.email!,
    firstName: meta?.first_name ?? '',
    lastName: meta?.last_name ?? '',
  }
}

export async function signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'https://www.chillnumbers.com'}/es/auth/login?verified=1`,
    }
  })
  if (error) throw new Error(error.message)
  return {
    id: data.user!.id,
    email: data.user!.email!,
    firstName,
    lastName,
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  await supabase.auth.signOut()
}

export async function getSession() {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const meta = data.user.user_metadata
  return {
    id: data.user.id,
    email: data.user.email!,
    firstName: meta?.first_name ?? '',
    lastName: meta?.last_name ?? '',
  }
}

export async function resetPassword(email: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  if (error) throw new Error(error.message)
}
