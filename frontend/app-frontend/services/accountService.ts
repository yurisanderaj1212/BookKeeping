// services/accountService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088/api'

// Enums que coinciden con el backend
export enum AccountType {
  Asset = 1,      // Activo
  Liability = 2,  // Pasivo
  Equity = 3,     // Patrimonio
  Income = 4,     // Ingreso
  Expense = 5     // Gasto
}

export enum AccountSubType {
  // Para Asset
  BankAccount = 1001,
  Cash = 1002,
  AccountsReceivable = 1003,
  Inventory = 1004,
  
  // Para Liability
  AccountsPayable = 2001,
  CreditCard = 2002,
  Loan = 2003,
  
  // Para Equity
  Capital = 3001,
  RetainedEarnings = 3002,
  
  // Para Income/Expense
  IncomeGeneral = 4001,
  ExpenseGeneral = 4002
}

// Interfaces
export interface Account {
  id: number
  name: string
  code?: string
  type: AccountType
  subType: AccountSubType
  currentBalance: number
  description?: string
  currency: string
  isActive: boolean
  createdAt: string
}

export interface CreateAccountDto {
  name: string
  code?: string
  type: AccountType
  subType: AccountSubType
  initialBalance: number
  description?: string
  currency: string
}

export interface AccountBalance {
  accountId: number
  accountName: string
  currentBalance: number
  currency: string
}

// Utilidades para labels en español
export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.Asset]: 'Activo',
  [AccountType.Liability]: 'Pasivo',
  [AccountType.Equity]: 'Patrimonio',
  [AccountType.Income]: 'Ingreso',
  [AccountType.Expense]: 'Gasto'
}

export const AccountSubTypeLabels: Record<AccountSubType, string> = {
  [AccountSubType.BankAccount]: 'Cuenta Bancaria',
  [AccountSubType.Cash]: 'Efectivo',
  [AccountSubType.AccountsReceivable]: 'Cuentas por Cobrar',
  [AccountSubType.Inventory]: 'Inventario',
  [AccountSubType.AccountsPayable]: 'Cuentas por Pagar',
  [AccountSubType.CreditCard]: 'Tarjeta de Crédito',
  [AccountSubType.Loan]: 'Préstamo',
  [AccountSubType.Capital]: 'Capital',
  [AccountSubType.RetainedEarnings]: 'Utilidades Retenidas',
  [AccountSubType.IncomeGeneral]: 'Ingreso General',
  [AccountSubType.ExpenseGeneral]: 'Gasto General'
}

// Obtener subtipos según el tipo de cuenta
export const getSubTypesForType = (type: AccountType): AccountSubType[] => {
  switch (type) {
    case AccountType.Asset:
      return [
        AccountSubType.BankAccount,
        AccountSubType.Cash,
        AccountSubType.AccountsReceivable,
        AccountSubType.Inventory
      ]
    case AccountType.Liability:
      return [
        AccountSubType.AccountsPayable,
        AccountSubType.CreditCard,
        AccountSubType.Loan
      ]
    case AccountType.Equity:
      return [
        AccountSubType.Capital,
        AccountSubType.RetainedEarnings
      ]
    case AccountType.Income:
      return [AccountSubType.IncomeGeneral]
    case AccountType.Expense:
      return [AccountSubType.ExpenseGeneral]
    default:
      return []
  }
}

class AccountService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  private getUserId(): number {
    const userStr = localStorage.getItem('user')
    if (!userStr) throw new Error('Usuario no autenticado')
    const user = JSON.parse(userStr)
    return user.id
  }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    const userId = this.getUserId()
    
    const response = await fetch(`${API_URL}/accounts/users/${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Error creando cuenta')
    }

    return response.json()
  }

  async getAccounts(): Promise<Account[]> {
    const userId = this.getUserId()
    
    const response = await fetch(`${API_URL}/accounts/users/${userId}`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error del backend:', errorText)
      throw new Error(`Error obteniendo cuentas: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async getAccountBalance(accountId: number): Promise<AccountBalance> {
    const response = await fetch(`${API_URL}/accounts/${accountId}/balance`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Error obteniendo balance')
    }

    return response.json()
  }

  async updateAccount(accountId: number, dto: Partial<CreateAccountDto>): Promise<Account> {
    const response = await fetch(`${API_URL}/accounts/${accountId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto)
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Error actualizando cuenta')
    }
    return response.json()
  }

  async deactivateAccount(accountId: number): Promise<void> {
    const response = await fetch(`${API_URL}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Error desactivando cuenta')
    }
  }
}

export const accountService = new AccountService()
export default accountService
