// Centralized employees data - will be replaced with API calls later

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  salary: number
  payrollType: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'contract' | 'provider'
  hourlyRate?: number
  hireDate?: string
  status: 'active' | 'inactive'
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  taxInfo?: {
    ssn: string // Last 4 digits only for security
    taxId?: string
    w4Status: string
  }
  benefits?: {
    healthInsurance: boolean
    dentalInsurance: boolean
    retirement401k: boolean
    paidTimeOff: number
  }
  notes?: string
  avatar?: string
}

// Mock employees data for small business
export const mockEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '(555) 123-4567',
    position: 'Gerente de Ventas',
    salary: 65000,
    payrollType: 'annual',
    hireDate: '2023-03-15',
    status: 'active',
    notes: 'Empleada destacada con excelente rendimiento en ventas'
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@company.com',
    phone: '(555) 234-5678',
    position: 'Desarrollador Senior',
    salary: 85000,
    payrollType: 'annual',
    hireDate: '2022-08-20',
    status: 'active',
    notes: 'Especialista en React y Node.js'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.chen@company.com',
    phone: '(555) 345-6789',
    position: 'Contadora',
    salary: 4800,
    payrollType: 'monthly',
    hireDate: '2023-01-10',
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@company.com',
    phone: '(555) 456-7890',
    position: 'Especialista en Marketing',
    hourlyRate: 28.50,
    payrollType: 'hourly',
    status: 'active',
    salary: 0
  },
  {
    id: '5',
    firstName: 'Jessica',
    lastName: 'Brown',
    email: 'jessica.brown@company.com',
    phone: '(555) 567-8901',
    position: 'Asistente Administrativa',
    salary: 1200,
    payrollType: 'biweekly',
    hireDate: '2023-09-15',
    status: 'active'
  },
  {
    id: '6',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@company.com',
    phone: '(555) 678-9012',
    position: 'Consultor',
    salary: 95000,
    payrollType: 'contract',
    status: 'inactive',
    notes: 'Contrato temporal - proyecto específico'
  }
]

// Helper functions
export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(employee => employee.id === id)
}

export const getActiveEmployees = (): Employee[] => {
  return mockEmployees.filter(employee => employee.status === 'active')
}

export const getEmployeesByPayrollType = (payrollType: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'contract' | 'provider'): Employee[] => {
  return mockEmployees.filter(employee => employee.payrollType === payrollType)
}

export const getTotalPayroll = (): number => {
  return mockEmployees
    .filter(emp => emp.status === 'active')
    .reduce((total, emp) => {
      if (emp.payrollType === 'annual' || emp.payrollType === 'contract' || emp.payrollType === 'provider') {
        return total + emp.salary
      } else if (emp.payrollType === 'hourly' && emp.hourlyRate) {
        // Assuming 40 hours per week, 52 weeks per year
        return total + (emp.hourlyRate * 40 * 52)
      } else if (emp.payrollType === 'weekly') {
        return total + (emp.salary * 52)
      } else if (emp.payrollType === 'biweekly') {
        return total + (emp.salary * 26)
      } else if (emp.payrollType === 'monthly') {
        return total + (emp.salary * 12)
      } else if (emp.payrollType === 'quarterly') {
        return total + (emp.salary * 4)
      }
      return total
    }, 0)
}

export const getEmployeeStats = () => {
  const active = getActiveEmployees()
  const positions = [...new Set(mockEmployees.map(emp => emp.position))]
  const avgSalary = active.length > 0 ? getTotalPayroll() / active.length : 0
  
  return {
    totalEmployees: mockEmployees.length,
    activeEmployees: active.length,
    positions: positions.length,
    totalPayroll: getTotalPayroll(),
    averageSalary: avgSalary
  }
}

export const formatSalary = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const getPositions = (): string[] => {
  return [...new Set(mockEmployees.map(emp => emp.position))].sort()
}

// Helper functions to calculate payroll expenses based on employees
export const calculatePayrollExpenses = (period: 'week' | 'month' | 'year' = 'month') => {
  const activeEmployees = getActiveEmployees()
  let totalPayrollExpense = 0

  activeEmployees.forEach(employee => {
    let periodCost = 0
    
    switch (period) {
      case 'week':
        if (employee.payrollType === 'hourly') {
          periodCost = (employee.hourlyRate || 0) * 40 // 40 hours per week
        } else if (employee.payrollType === 'weekly') {
          periodCost = employee.salary
        } else if (employee.payrollType === 'biweekly') {
          periodCost = employee.salary / 2
        } else if (employee.payrollType === 'monthly') {
          periodCost = employee.salary / 4.33 // Average weeks per month
        } else if (employee.payrollType === 'quarterly') {
          periodCost = employee.salary / 13 // Weeks per quarter
        } else { // annual, contract, provider
          periodCost = employee.salary / 52
        }
        break
        
      case 'month':
        if (employee.payrollType === 'hourly') {
          periodCost = (employee.hourlyRate || 0) * 40 * 4.33 // Average weeks per month
        } else if (employee.payrollType === 'weekly') {
          periodCost = employee.salary * 4.33
        } else if (employee.payrollType === 'biweekly') {
          periodCost = employee.salary * 2.17 // Bi-weekly payments per month
        } else if (employee.payrollType === 'monthly') {
          periodCost = employee.salary
        } else if (employee.payrollType === 'quarterly') {
          periodCost = employee.salary / 3
        } else { // annual, contract, provider
          periodCost = employee.salary / 12
        }
        break
        
      case 'year':
        if (employee.payrollType === 'hourly') {
          periodCost = (employee.hourlyRate || 0) * 40 * 52
        } else if (employee.payrollType === 'weekly') {
          periodCost = employee.salary * 52
        } else if (employee.payrollType === 'biweekly') {
          periodCost = employee.salary * 26
        } else if (employee.payrollType === 'monthly') {
          periodCost = employee.salary * 12
        } else if (employee.payrollType === 'quarterly') {
          periodCost = employee.salary * 4
        } else { // annual, contract, provider
          periodCost = employee.salary
        }
        break
    }
    
    totalPayrollExpense += periodCost
  })

  return totalPayrollExpense
}

// Function to get payroll breakdown by employee for reports
export const getPayrollBreakdown = (period: 'week' | 'month' | 'year' = 'month') => {
  const activeEmployees = getActiveEmployees()
  
  return activeEmployees.map(employee => {
    let periodCost = 0
    let frequency = ''
    
    switch (period) {
      case 'week':
        if (employee.payrollType === 'hourly') {
          periodCost = (employee.hourlyRate || 0) * 40
          frequency = 'Por horas (40h/semana)'
        } else if (employee.payrollType === 'weekly') {
          periodCost = employee.salary
          frequency = 'Semanal'
        } else if (employee.payrollType === 'biweekly') {
          periodCost = employee.salary / 2
          frequency = 'Quincenal (prorrateado)'
        } else if (employee.payrollType === 'monthly') {
          periodCost = employee.salary / 4.33
          frequency = 'Mensual (prorrateado)'
        } else if (employee.payrollType === 'quarterly') {
          periodCost = employee.salary / 13
          frequency = 'Trimestral (prorrateado)'
        } else {
          periodCost = employee.salary / 52
          frequency = 'Anual (prorrateado)'
        }
        break
        
      case 'month':
        if (employee.payrollType === 'hourly') {
          periodCost = (employee.hourlyRate || 0) * 40 * 4.33
          frequency = 'Por horas (173h/mes)'
        } else if (employee.payrollType === 'weekly') {
          periodCost = employee.salary * 4.33
          frequency = 'Semanal (4.33 pagos/mes)'
        } else if (employee.payrollType === 'biweekly') {
          periodCost = employee.salary * 2.17
          frequency = 'Quincenal (2.17 pagos/mes)'
        } else if (employee.payrollType === 'monthly') {
          periodCost = employee.salary
          frequency = 'Mensual'
        } else if (employee.payrollType === 'quarterly') {
          periodCost = employee.salary / 3
          frequency = 'Trimestral (prorrateado)'
        } else {
          periodCost = employee.salary / 12
          frequency = 'Anual (prorrateado)'
        }
        break
        
      case 'year':
        if (employee.payrollType === 'hourly') {
          periodCost = (employee.hourlyRate || 0) * 40 * 52
          frequency = 'Por horas (2080h/año)'
        } else if (employee.payrollType === 'weekly') {
          periodCost = employee.salary * 52
          frequency = 'Semanal (52 pagos/año)'
        } else if (employee.payrollType === 'biweekly') {
          periodCost = employee.salary * 26
          frequency = 'Quincenal (26 pagos/año)'
        } else if (employee.payrollType === 'monthly') {
          periodCost = employee.salary * 12
          frequency = 'Mensual (12 pagos/año)'
        } else if (employee.payrollType === 'quarterly') {
          periodCost = employee.salary * 4
          frequency = 'Trimestral (4 pagos/año)'
        } else {
          periodCost = employee.salary
          frequency = employee.payrollType === 'annual' ? 'Anual' : 
                     employee.payrollType === 'contract' ? 'Contrato' : 'Proveedor'
        }
        break
    }
    
    return {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      payrollType: employee.payrollType,
      frequency,
      periodCost,
      originalSalary: employee.payrollType === 'hourly' ? employee.hourlyRate : employee.salary
    }
  })
}