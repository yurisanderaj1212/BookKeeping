'use client'

import { useState, useEffect } from 'react'

export type Language = 'en' | 'es'

interface Translations {
  en: Record<string, string>
  es: Record<string, string>
}

const translations: Translations = {
  en: {
    // Login page
    'login.welcome': 'Welcome back',
    'login.subtitle': 'Sign in to your account to continue managing your finances',
    'login.rating': '4.9/5 rating by 10,000+ users',
    'login.title': 'Manage your finances with confidence',
    'login.description': 'Join thousands of businesses that simplify their accounting with our intuitive and secure platform.',
    'login.feature1.title': 'Real-time dashboard',
    'login.feature1.desc': 'View your income and expenses instantly',
    'login.feature2.title': 'Bank integration',
    'login.feature2.desc': 'Connect accounts and sync automatically',
    'login.feature3.title': 'Smart reports',
    'login.feature3.desc': 'Generate professional reports in seconds',
    'login.testimonial': '"Chill Numbers completely transformed how I manage my business finances. Everything is clearer and more organized now."',
    'login.testimonial.name': 'Maria Rodriguez',
    'login.testimonial.title': 'CEO, TechStart Inc.',
    
    // Register page
    'register.badge': '30-day free trial - No credit card required',
    'register.title': 'Start your journey to financial success',
    'register.description': 'Join over 10,000 businesses that trust Chill Numbers to manage their finances simply and effectively.',
    'register.feature1.title': '5-minute setup',
    'register.feature1.desc': 'Start using the platform immediately',
    'register.feature2.title': 'Bank-level security',
    'register.feature2.desc': 'Your data is protected with 256-bit encryption',
    'register.feature3.title': '24/7 support',
    'register.feature3.desc': 'Our team is always available to help you',
    'register.feature4.title': 'Cancel anytime',
    'register.feature4.desc': 'No commitments or penalties',
    'register.stats.users': 'Active users',
    'register.stats.uptime': 'Uptime',
    'register.stats.rating': 'Rating',
    
    // Common
    'common.createAccount': 'Create your account',
    'common.freeTrialSubtitle': 'Start your 30-day free trial. No credit card required.',
  },
  es: {
    // Login page
    'login.welcome': 'Bienvenido de vuelta',
    'login.subtitle': 'Inicia sesión en tu cuenta para continuar gestionando tus finanzas',
    'login.rating': 'Calificación 4.9/5 por más de 10,000 usuarios',
    'login.title': 'Gestiona tus finanzas con confianza',
    'login.description': 'Únete a miles de negocios que ya simplifican su contabilidad con nuestra plataforma intuitiva y segura.',
    'login.feature1.title': 'Dashboard en tiempo real',
    'login.feature1.desc': 'Visualiza tus ingresos y gastos al instante',
    'login.feature2.title': 'Integración bancaria',
    'login.feature2.desc': 'Conecta tus cuentas y sincroniza automáticamente',
    'login.feature3.title': 'Reportes inteligentes',
    'login.feature3.desc': 'Genera informes profesionales en segundos',
    'login.testimonial': '"Chill Numbers transformó completamente la manera en que manejo las finanzas de mi negocio. Ahora todo es más claro y organizado."',
    'login.testimonial.name': 'María Rodríguez',
    'login.testimonial.title': 'CEO, TechStart Inc.',
    
    // Register page
    'register.badge': '30 días de prueba gratis - Sin tarjeta requerida',
    'register.title': 'Comienza tu viaje hacia el éxito financiero',
    'register.description': 'Únete a más de 10,000 negocios que ya confían en Chill Numbers para gestionar sus finanzas de manera simple y efectiva.',
    'register.feature1.title': 'Configuración en 5 minutos',
    'register.feature1.desc': 'Empieza a usar la plataforma inmediatamente',
    'register.feature2.title': 'Seguridad de nivel bancario',
    'register.feature2.desc': 'Tus datos están protegidos con encriptación de 256 bits',
    'register.feature3.title': 'Soporte 24/7',
    'register.feature3.desc': 'Nuestro equipo está siempre disponible para ayudarte',
    'register.feature4.title': 'Cancela cuando quieras',
    'register.feature4.desc': 'Sin compromisos ni penalizaciones',
    'register.stats.users': 'Usuarios activos',
    'register.stats.uptime': 'Uptime',
    'register.stats.rating': 'Calificación',
    
    // Common
    'common.createAccount': 'Crea tu cuenta',
    'common.freeTrialSubtitle': 'Comienza tu prueba gratuita de 30 días. No se requiere tarjeta de crédito.',
  }
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Detect browser language only once on mount
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.toLowerCase()
      const detectedLang: Language = browserLang.startsWith('es') ? 'es' : 'en'
      setLanguage(detectedLang)
    }
  }, [])

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return { language, t }
}