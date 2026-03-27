import { getSupabase } from '@/lib/supabaseClient'

export enum PayrollType { Hourly=1, Weekly=2, Biweekly=3, Monthly=4, Quarterly=5, Annual=6, Contract=7, Provider=8 }
export enum EmployeeStatus { Active=1, Inactive=2 }

export interface Employee {
  id: number
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  position: string
  salary: number
  payroll_type: PayrollType
  hourly_rate?: number
  hire_date?: string
  status: EmployeeStatus
  notes?: string
  avatar?: string
  created_at: string
  updated_at: string
  // legacy aliases for compatibility
  firstName: string
  lastName: string
  payrollType: PayrollType
  hourlyRate?: number
  hireDate?: string
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
  notes?: string
  avatar?: string
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>

export const PayrollTypeLabels: Record<PayrollType, string> = {
  [PayrollType.Hourly]: 'Por Hora', [PayrollType.Weekly]: 'Semanal',
  [PayrollType.Biweekly]: 'Quincenal', [PayrollType.Monthly]: 'Mensual',
  [PayrollType.Quarterly]: 'Trimestral', [PayrollType.Annual]: 'Anual',
  [PayrollType.Contract]: 'Contrato', [PayrollType.Provider]: 'Proveedor'
}

export const EmployeeStatusLabels: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]: 'Activo', [EmployeeStatus.Inactive]: 'Inactivo'
}

// Mapea snake_case de Supabase a camelCase para compatibilidad con componentes
function mapEmployee(r: any): Employee {
  return {
    ...r,
    firstName: r.first_name, lastName: r.last_name,
    payrollType: r.payroll_type, hourlyRate: r.hourly_rate,
    hireDate: r.hire_date,
  }
}

class EmployeeService {
  async getAllEmployees(): Promise<Employee[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('employees').select('*').order('last_name')
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapEmployee)
  }

  async getActiveEmployees(): Promise<Employee[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('employees').select('*').eq('status', EmployeeStatus.Active).order('last_name')
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapEmployee)
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('employees')
      .insert({
        first_name: dto.firstName, last_name: dto.lastName, email: dto.email,
        phone: dto.phone, position: dto.position, salary: dto.salary,
        payroll_type: dto.payrollType, hourly_rate: dto.hourlyRate,
        hire_date: dto.hireDate, status: dto.status ?? EmployeeStatus.Active,
        notes: dto.notes, avatar: dto.avatar,
      })
      .select().single()
    if (error) throw new Error(error.message)
    return mapEmployee(data)
  }

  async updateEmployee(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const supabase = getSupabase()
    const patch: any = { updated_at: new Date().toISOString() }
    if (dto.firstName !== undefined) patch.first_name = dto.firstName
    if (dto.lastName !== undefined) patch.last_name = dto.lastName
    if (dto.email !== undefined) patch.email = dto.email
    if (dto.phone !== undefined) patch.phone = dto.phone
    if (dto.position !== undefined) patch.position = dto.position
    if (dto.salary !== undefined) patch.salary = dto.salary
    if (dto.payrollType !== undefined) patch.payroll_type = dto.payrollType
    if (dto.hourlyRate !== undefined) patch.hourly_rate = dto.hourlyRate
    if (dto.hireDate !== undefined) patch.hire_date = dto.hireDate
    if (dto.status !== undefined) patch.status = dto.status
    if (dto.notes !== undefined) patch.notes = dto.notes

    const { data, error } = await supabase
      .from('employees').update(patch).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return mapEmployee(data)
  }

  async deleteEmployee(id: number): Promise<void> {
    const supabase = getSupabase()
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async getTotalPayroll(): Promise<number> {
    const employees = await this.getActiveEmployees()
    return employees.reduce((sum, e) => sum + e.salary, 0)
  }

  async getPagedEmployees(params: EmployeeQueryParameters = {}): Promise<PagedEmployees> {
    const supabase = getSupabase()
    const page = params.pageNumber ?? 1
    const size = params.pageSize ?? 20
    const from = (page - 1) * size
    const to = from + size - 1

    let query = supabase.from('employees').select('*', { count: 'exact' })
    if (params.status !== undefined) query = query.eq('status', params.status)
    if (params.search) query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    query = query.order(params.sortBy === 'name' ? 'last_name' : 'created_at', { ascending: params.sortDirection === 'asc' })
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    const total = count ?? 0
    const totalPages = Math.ceil(total / size)
    return {
      data: (data ?? []).map(mapEmployee),
      pagination: { currentPage: page, pageSize: size, totalRecords: total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 }
    }
  }
}

export const employeeService = new EmployeeService()
export default employeeService

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

export interface EmployeeQueryParameters {
  status?: number
  search?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}
