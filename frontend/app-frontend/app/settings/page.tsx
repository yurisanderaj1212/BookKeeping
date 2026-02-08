'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
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
  DollarSign
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import HelpButton from '@/components/onboarding/HelpButton'
import { useOnboarding } from '@/hooks/useOnboarding'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  jobTitle: string
  company: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  timezone: string
  language: string
  currency: string
  dateFormat: string
}

interface CompanySettings {
  companyName: string
  businessType: string
  taxId: string
  fiscalYearStart: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  phone: string
  email: string
  website?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  transactionAlerts: boolean
  reportReminders: boolean
  weeklyDigest: boolean
  monthlyReports: boolean
  lowBalanceAlerts: boolean
  expenseThresholds: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordLastChanged: string
  loginAlerts: boolean
}

// Profile Tab Component
const ProfileTab = ({ 
  formUserProfile, 
  setFormUserProfile, 
  isLoading, 
  handleSave 
}: {
  formUserProfile: UserProfile
  setFormUserProfile: (profile: UserProfile) => void
  isLoading: boolean
  handleSave: (section: string) => void
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
      
      {/* Avatar Section */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
            <Camera className="w-3 h-3 text-white" />
          </button>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{formUserProfile.firstName} {formUserProfile.lastName}</h4>
          <p className="text-sm text-gray-500">{formUserProfile.jobTitle}</p>
          <button className="text-sm text-primary-600 hover:text-primary-700 mt-1">
            Cambiar foto de perfil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={formUserProfile.firstName}
            onChange={(e) => setFormUserProfile({ ...formUserProfile, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            value={formUserProfile.lastName}
            onChange={(e) => setFormUserProfile({ ...formUserProfile, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formUserProfile.email}
              onChange={(e) => setFormUserProfile({ ...formUserProfile, email: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formUserProfile.phone}
              onChange={(e) => setFormUserProfile({ ...formUserProfile, phone: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Posición</label>
          <input
            type="text"
            value={formUserProfile.jobTitle}
            onChange={(e) => setFormUserProfile({ ...formUserProfile, jobTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>

    {/* Address Section */}
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-gray-600" />
        Dirección Personal
      </h3>
      <p className="text-sm text-gray-500 mb-4">Información opcional para facturación y correspondencia</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
          <input
            type="text"
            value={formUserProfile.address?.street || ''}
            onChange={(e) => setFormUserProfile({
              ...formUserProfile,
              address: { ...formUserProfile.address, street: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="123 Main Street"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad (Opcional)</label>
          <input
            type="text"
            value={formUserProfile.address?.city || ''}
            onChange={(e) => setFormUserProfile({
              ...formUserProfile,
              address: { ...formUserProfile.address, city: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Miami"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado (Opcional)</label>
          <select
            value={formUserProfile.address?.state || ''}
            onChange={(e) => setFormUserProfile({
              ...formUserProfile,
              address: { ...formUserProfile.address, state: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar estado</option>
            <option value="FL">Florida</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
            <option value="IL">Illinois</option>
            <option value="PA">Pennsylvania</option>
            <option value="OH">Ohio</option>
            <option value="GA">Georgia</option>
            <option value="NC">North Carolina</option>
            <option value="MI">Michigan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal (Opcional)</label>
          <input
            type="text"
            value={formUserProfile.address?.zipCode || ''}
            onChange={(e) => setFormUserProfile({
              ...formUserProfile,
              address: { ...formUserProfile.address, zipCode: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="33101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">País (Opcional)</label>
          <select
            value={formUserProfile.address?.country || 'Estados Unidos'}
            onChange={(e) => setFormUserProfile({
              ...formUserProfile,
              address: { ...formUserProfile.address, country: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="México">México</option>
            <option value="Canadá">Canadá</option>
          </select>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        onClick={() => handleSave('perfil')}
        disabled={isLoading}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
      </button>
    </div>
  </div>
)

// Company Tab Component
const CompanyTab = ({ 
  formCompanySettings, 
  setFormCompanySettings, 
  isLoading, 
  handleSave 
}: {
  formCompanySettings: CompanySettings
  setFormCompanySettings: (settings: CompanySettings) => void
  isLoading: boolean
  handleSave: (section: string) => void
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
          <input
            type="text"
            value={formCompanySettings.companyName}
            onChange={(e) => setFormCompanySettings({ ...formCompanySettings, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Negocio</label>
          <select
            value={formCompanySettings.businessType}
            onChange={(e) => setFormCompanySettings({ ...formCompanySettings, businessType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Servicios Profesionales">Servicios Profesionales</option>
            <option value="Retail">Retail</option>
            <option value="Manufactura">Manufactura</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Consultoría">Consultoría</option>
            <option value="Restaurante">Restaurante</option>
            <option value="Construcción">Construcción</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Fiscal (EIN) - Opcional</label>
          <input
            type="text"
            value={formCompanySettings.taxId}
            onChange={(e) => setFormCompanySettings({ ...formCompanySettings, taxId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="12-3456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inicio del Año Fiscal</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={formCompanySettings.fiscalYearStart}
              onChange={(e) => setFormCompanySettings({ ...formCompanySettings, fiscalYearStart: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="01-01">1 de Enero</option>
              <option value="04-01">1 de Abril</option>
              <option value="07-01">1 de Julio</option>
              <option value="10-01">1 de Octubre</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de la Empresa</label>
          <input
            type="tel"
            value={formCompanySettings.phone}
            onChange={(e) => setFormCompanySettings({ ...formCompanySettings, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email de la Empresa</label>
          <input
            type="email"
            value={formCompanySettings.email}
            onChange={(e) => setFormCompanySettings({ ...formCompanySettings, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web (Opcional)</label>
          <input
            type="url"
            value={formCompanySettings.website || ''}
            onChange={(e) => setFormCompanySettings({ ...formCompanySettings, website: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="www.miempresa.com"
          />
        </div>
      </div>
    </div>

    {/* Company Address */}
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Dirección de la Empresa</h3>
      <p className="text-sm text-gray-500 mb-4">Información opcional para facturación y documentos oficiales</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
          <input
            type="text"
            value={formCompanySettings.address?.street || ''}
            onChange={(e) => setFormCompanySettings({
              ...formCompanySettings,
              address: { ...formCompanySettings.address, street: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="123 Business Avenue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad (Opcional)</label>
          <input
            type="text"
            value={formCompanySettings.address?.city || ''}
            onChange={(e) => setFormCompanySettings({
              ...formCompanySettings,
              address: { ...formCompanySettings.address, city: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Miami"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado (Opcional)</label>
          <select
            value={formCompanySettings.address?.state || ''}
            onChange={(e) => setFormCompanySettings({
              ...formCompanySettings,
              address: { ...formCompanySettings.address, state: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar estado</option>
            <option value="FL">Florida</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
            <option value="IL">Illinois</option>
            <option value="PA">Pennsylvania</option>
            <option value="OH">Ohio</option>
            <option value="GA">Georgia</option>
            <option value="NC">North Carolina</option>
            <option value="MI">Michigan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal (Opcional)</label>
          <input
            type="text"
            value={formCompanySettings.address?.zipCode || ''}
            onChange={(e) => setFormCompanySettings({
              ...formCompanySettings,
              address: { ...formCompanySettings.address, zipCode: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="33101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">País (Opcional)</label>
          <select
            value={formCompanySettings.address?.country || 'Estados Unidos'}
            onChange={(e) => setFormCompanySettings({
              ...formCompanySettings,
              address: { ...formCompanySettings.address, country: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="México">México</option>
            <option value="Canadá">Canadá</option>
          </select>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        onClick={() => handleSave('empresa')}
        disabled={isLoading}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
      </button>
    </div>
  </div>
)

export default function SettingsPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Onboarding hook
  const {
    isOnboardingOpen,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding
  } = useOnboarding()

  // Original saved data
  const [savedUserProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '(555) 123-4567',
    jobTitle: 'Contador Principal',
    company: 'Mi Empresa LLC',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Estados Unidos'
    },
    timezone: 'America/New_York',
    language: 'es',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  })

  const [savedCompanySettings] = useState<CompanySettings>({
    companyName: 'Mi Empresa LLC',
    businessType: 'Servicios Profesionales',
    taxId: '',
    fiscalYearStart: '01-01',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Estados Unidos'
    },
    phone: '(555) 987-6543',
    email: 'info@miempresa.com',
    website: ''
  })

  // Editable form data
  const [formUserProfile, setFormUserProfile] = useState<UserProfile>(savedUserProfile)
  const [formCompanySettings, setFormCompanySettings] = useState<CompanySettings>(savedCompanySettings)

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    transactionAlerts: true,
    reportReminders: true,
    weeklyDigest: false,
    monthlyReports: true,
    lowBalanceAlerts: true,
    expenseThresholds: false
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordLastChanged: '2024-01-15',
    loginAlerts: true
  })

  // Todos los useCallback también al inicio
  const handleSave = useCallback(async (section: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert(`Configuración de ${section} guardada exitosamente`)
  }, [])

  const handleExportData = useCallback(() => {
    alert('Exportando datos del usuario...')
  }, [])

  const handleDeleteAccount = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      alert('Cuenta eliminada')
    }
  }, [])

  // RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }
  
  // Si no está autenticado, el hook ya redirigió al login
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  const tabs = [
    { id: 'profile', label: 'Perfil Personal', icon: User },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'preferences', label: 'Preferencias', icon: Palette }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            formUserProfile={formUserProfile}
            setFormUserProfile={setFormUserProfile}
            isLoading={isLoading}
            handleSave={handleSave}
          />
        )
      case 'company':
        return (
          <CompanyTab
            formCompanySettings={formCompanySettings}
            setFormCompanySettings={setFormCompanySettings}
            isLoading={isLoading}
            handleSave={handleSave}
          />
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificaciones</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Notificaciones por Email', description: 'Recibir notificaciones generales por correo electrónico' },
                  { key: 'transactionAlerts', label: 'Alertas de Transacciones', description: 'Notificar cuando se agreguen nuevas transacciones' },
                  { key: 'reportReminders', label: 'Recordatorios de Reportes', description: 'Recordar generar reportes mensuales y trimestrales' },
                  { key: 'weeklyDigest', label: 'Resumen Semanal', description: 'Recibir un resumen semanal de actividad financiera' },
                  { key: 'monthlyReports', label: 'Reportes Mensuales', description: 'Envío automático de reportes mensuales por email' },
                  { key: 'lowBalanceAlerts', label: 'Alertas de Saldo Bajo', description: 'Notificar cuando los saldos estén por debajo del límite' },
                  { key: 'expenseThresholds', label: 'Límites de Gastos', description: 'Alertar cuando los gastos excedan los límites establecidos' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof NotificationSettings] as boolean}
                        onChange={(e) => setNotifications(prev => ({
                          ...prev,
                          [item.key]: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('notificaciones')}
                disabled={isLoading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>
              
              {/* Password Section */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Contraseña</h4>
                <p className="text-sm text-gray-500 mb-4">Última actualización: {security.passwordLastChanged}</p>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                  Cambiar Contraseña
                </button>
              </div>

              {/* Two Factor Auth */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Autenticación de Dos Factores</h4>
                    <p className="text-sm text-gray-500 mt-1">Agregar una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.twoFactorAuth}
                      onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Tiempo de Sesión</h4>
                <p className="text-sm text-gray-500 mb-3">Cerrar sesión automáticamente después de inactividad</p>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={0}>Nunca</option>
                </select>
              </div>

              {/* Login Alerts */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Alertas de Inicio de Sesión</h4>
                    <p className="text-sm text-gray-500 mt-1">Notificar sobre inicios de sesión desde nuevos dispositivos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.loginAlerts}
                      onChange={(e) => setSecurity(prev => ({ ...prev, loginAlerts: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('seguridad')}
                disabled={isLoading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        )
      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias del Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <select
                      value={formUserProfile.language}
                      onChange={(e) => setFormUserProfile(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <select
                      value={formUserProfile.currency}
                      onChange={(e) => setFormUserProfile(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="CAD">CAD - Dólar Canadiense</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Fecha</label>
                  <select
                    value={formUserProfile.dateFormat}
                    onChange={(e) => setFormUserProfile(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                  <select
                    value={formUserProfile.timezone}
                    onChange={(e) => setFormUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Mexico_City">Mexico City</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Datos</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Exportar Datos</h4>
                    <p className="text-sm text-gray-500 mt-1">Descargar todos tus datos en formato JSON</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">Eliminar Cuenta</h4>
                    <p className="text-sm text-red-600 mt-1">Eliminar permanentemente tu cuenta y todos los datos</p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('preferencias')}
                disabled={isLoading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        )
      default:
        return (
          <ProfileTab
            formUserProfile={formUserProfile}
            setFormUserProfile={setFormUserProfile}
            isLoading={isLoading}
            handleSave={handleSave}
          />
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Configuración
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona tu perfil, empresa y preferencias del sistema
                </p>
              </div>
            </div>

            {/* Onboarding Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour de Introducción</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vuelve a ver el tour guiado para familiarizarte con todas las funciones de la aplicación.
              </p>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tour Interactivo</h4>
                    <p className="text-sm text-gray-500">Aprende a usar cada función paso a paso</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetOnboarding()
                    router.push('/dashboard')
                    setTimeout(() => startOnboarding(), 1000)
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Iniciar Tour
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tabs Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}