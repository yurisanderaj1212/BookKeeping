import { apiClient } from '@/lib/apiClient'

export enum PayrollType {
  Hourly = 1,
  Weekly = 2,
  Biweekly = 3,
  Monthly = 4,
  Quarterly = 5,
  Annual = 6,
  Contract = 7,
  Provider = 8
}

export enum EmployeeStatus {
  Active = 1,
  Inactive = 2
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface EmergencyContact {
  name?: string
  relationship?: string
  phone?: string
}

export interface TaxInfo {
  /** Solo últimos 4 dígitos del SSN — nunca almacenar el número completo */
  ssnLast4?: string
  taxId?: string
  w4Status?: string
}

/** Formatea los últimos 4 dígitos del SSN de forma segura: ***-**-XXXX */
export function maskSsn(last4?: string): string {
  if (!last4) return '—'
  return `***-**-${last4.slice(-4)}`
}

export interface Benefits {
  healthInsurance: boolean
  dentalInsurance: boolean
  retirement401k: boolean
  paidTimeOff: number
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  position: string
  salary: number
  payrollType: PayrollType
  hourlyRate?: number
  hireDate?: string
  status: EmployeeStatus
  address?: Address
  emergencyContact?: EmergencyContact
  taxInfo?: TaxInfo
  benefits?: Benefits
  notes?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  position: string
  salary: number
  payrollType: PayrollType
  hourlyRate?: number
  hireDate?: string
  status?: EmployeeStatus
  address?: Address
  emergencyContact?: EmergencyContact
  taxInfo?: TaxInfo
  benefits?: Benefits
  notes?: string
  avatar?: string
}

export interface EmployeeQueryParameters {
  status?: number       // 1 = Active, 2 = Inactive
  search?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface PaginationMetadata {
  currentPage: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PagedEmployees {
  data: Employee[]
  pagination: PaginationMetadata
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>

export const PayrollTypeLabels: Record<PayrollType, string> = {
  [PayrollType.Hourly]: 'Por Hora',
  [PayrollType.Weekly]: 'Semanal',
  [PayrollType.Biweekly]: 'Quincenal',
  [PayrollType.Monthly]: 'Mensual',
  [PayrollType.Quarterly]: 'Trimestral',
  [PayrollType.Annual]: 'Anual',
  [PayrollType.Contract]: 'Contrato',
  [PayrollType.Provider]: 'Proveedor'
}

export const EmployeeStatusLabels: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]: 'Activo',
  [EmployeeStatus.Inactive]: 'Inactivo'
}

class EmployeeService {
  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return apiClient('/employees', { method: 'POST', body: JSON.stringify(dto) })
  }

  async getAllEmployees(): Promise<Employee[]> {
    return apiClient('/employees')
  }

  async getEmployeeById(id: number): Promise<Employee> {
    return apiClient(`/employees/${id}`)
  }

  async updateEmployee(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    return apiClient(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(dto) })
  }

  async deleteEmployee(id: number): Promise<void> {
    return apiClient(`/employees/${id}`, { method: 'DELETE' })
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return apiClient('/employees/active')
  }

  async getTotalPayroll(): Promise<number> {
    const data = await apiClient<{ totalAnnualPayroll: number }>('/employees/payroll/total')
    return data.totalAnnualPayroll
  }

  async getPagedEmployees(params: EmployeeQueryParameters = {}): Promise<PagedEmployees> {
    const q = new URLSearchParams()
    if (params.status !== undefined) q.append('status', String(params.status))
    if (params.search) q.append('search', params.search)
    if (params.pageNumber) q.append('pageNumber', String(params.pageNumber))
    if (params.pageSize) q.append('pageSize', String(params.pageSize))
    if (params.sortBy) q.append('sortBy', params.sortBy)
    if (params.sortDirection) q.append('sortDirection', params.sortDirection)
    const qs = q.toString()
    return apiClient(`/employees/paged${qs ? `?${qs}` : ''}`)
  }
}

export const employeeService = new EmployeeService()
export default employeeService
