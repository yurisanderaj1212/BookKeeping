import { getSupabase } from '@/lib/supabaseClient'

export enum AccountType { Asset=1, Liability=2, Equity=3, Income=4, Expense=5 }
export enum AccountSubType {
  BankAccount=1001, Cash=1002, AccountsReceivable=1003, Inventory=1004,
  AccountsPayable=2001, CreditCard=2002, Loan=2003,
  Capital=3001, RetainedEarnings=3002, IncomeGeneral=4001, ExpenseGeneral=4002
}

export interface Account {
  id: number
  user_id: string
  name: string
  code?: string
  type: AccountType
  sub_type: AccountSubType
  current_balance: number
  initial_balance: number
  description?: string
  currency: string
  is_active: boolean
  created_at: string
  // camelCase aliases for component compatibility
  currentBalance: number
  initialBalance: number
  isActive: boolean
  subType: AccountSubType
  createdAt: string
}

export interface CreateAccountDto {
  name: string
  code?: string
  type: AccountType
  sub_type?: AccountSubType
  subType?: AccountSubType   // alias
  initial_balance?: number
  initialBalance?: number    // alias
  description?: string
  currency: string
}

export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.Asset]: 'Activo', [AccountType.Liability]: 'Pasivo',
  [AccountType.Equity]: 'Patrimonio', [AccountType.Income]: 'Ingreso', [AccountType.Expense]: 'Gasto'
}

export const AccountSubTypeLabels: Record<AccountSubType, string> = {
  [AccountSubType.BankAccount]: 'Cuenta Bancaria', [AccountSubType.Cash]: 'Efectivo',
  [AccountSubType.AccountsReceivable]: 'Cuentas por Cobrar', [AccountSubType.Inventory]: 'Inventario',
  [AccountSubType.AccountsPayable]: 'Cuentas por Pagar', [AccountSubType.CreditCard]: 'Tarjeta de Crédito',
  [AccountSubType.Loan]: 'Préstamo', [AccountSubType.Capital]: 'Capital',
  [AccountSubType.RetainedEarnings]: 'Utilidades Retenidas',
  [AccountSubType.IncomeGeneral]: 'Ingreso General', [AccountSubType.ExpenseGeneral]: 'Gasto General'
}

function mapAccount(r: any): Account {
  return { ...r, currentBalance: r.current_balance, initialBalance: r.initial_balance, isActive: r.is_active, subType: r.sub_type, createdAt: r.created_at }
}

class AccountService {
  async getAccounts(): Promise<Account[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('accounts').select('*').eq('is_active', true).order('name')
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapAccount)
  }

  // Creates a default Cash account if the user doesn't have one yet
  async ensureCashAccount(): Promise<void> {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('sub_type', AccountSubType.Cash)
      .eq('user_id', user.id)
      .limit(1)
    if (existing && existing.length > 0) return // already has one

    await supabase.from('accounts').insert({
      user_id: user.id,
      name: 'Efectivo / Cash',
      type: AccountType.Asset,
      sub_type: AccountSubType.Cash,
      initial_balance: 0,
      current_balance: 0,
      currency: 'USD',
      description: 'Cuenta de efectivo para registrar ingresos y gastos en efectivo',
    })
  }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    const supabase = getSupabase()
    const balance = dto.initial_balance ?? dto.initialBalance ?? 0
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        name: dto.name, code: dto.code, type: dto.type,
        sub_type: dto.sub_type ?? dto.subType,
        initial_balance: balance, current_balance: balance,
        description: dto.description, currency: dto.currency,
      })
      .select().single()
    if (error) throw new Error(error.message)
    return mapAccount(data)
  }

  async updateAccount(id: number, dto: Partial<CreateAccountDto>): Promise<Account> {
    const supabase = getSupabase()
    const patch: any = { updated_at: new Date().toISOString() }
    if (dto.name) patch.name = dto.name
    if (dto.code !== undefined) patch.code = dto.code
    if (dto.type !== undefined) patch.type = dto.type
    if (dto.sub_type ?? dto.subType) patch.sub_type = dto.sub_type ?? dto.subType
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.currency) patch.currency = dto.currency
    const { data, error } = await supabase
      .from('accounts').update(patch).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return mapAccount(data)
  }

  async deactivateAccount(id: number): Promise<void> {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('accounts').update({ is_active: false }).eq('id', id)
    if (error) throw new Error(error.message)
  }
}

export const accountService = new AccountService()
export default accountService

export const getSubTypesForType = (type: AccountType): AccountSubType[] => {
  switch (type) {
    case AccountType.Asset:     return [AccountSubType.BankAccount, AccountSubType.Cash, AccountSubType.AccountsReceivable, AccountSubType.Inventory]
    case AccountType.Liability: return [AccountSubType.AccountsPayable, AccountSubType.CreditCard, AccountSubType.Loan]
    case AccountType.Equity:    return [AccountSubType.Capital, AccountSubType.RetainedEarnings]
    case AccountType.Income:    return [AccountSubType.IncomeGeneral]
    case AccountType.Expense:   return [AccountSubType.ExpenseGeneral]
    default: return []
  }
}
