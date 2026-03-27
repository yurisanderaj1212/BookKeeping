import { getSupabase } from '@/lib/supabaseClient'

export interface CategoryDto {
  id: number
  name: string
  type: number  // 0=Income, 1=Expense
  display_order: number
  is_active: boolean
  // camelCase aliases
  isActive: boolean
  displayOrder: number
  isSystemDefault: boolean
}

export async function getAll(): Promise<CategoryDto[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('type')
    .order('display_order')
  if (error) throw new Error(error.message)
  return (data ?? []).map(r => ({ ...r, isActive: r.is_active, displayOrder: r.display_order, isSystemDefault: false }))
}

export async function getById(id: number): Promise<CategoryDto | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('categories').select('*').eq('id', id).single()
  if (error) return null
  return data
}
