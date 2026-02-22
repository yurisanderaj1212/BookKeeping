'use client'

import { useState, useEffect } from 'react'

const ONBOARDING_STORAGE_KEY = 'chill-numbers-onboarding-completed'
const WELCOME_SHOWN_KEY = 'chill-numbers-welcome-shown'
const TOUR_PROGRESS_KEY = 'chill-numbers-tour-progress'

export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true) // Default to true to avoid flash
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)

  // Función para detectar si es un usuario realmente nuevo
  const isReallyNewUser = () => {
    const hasAnyOnboardingData = 
      localStorage.getItem(ONBOARDING_STORAGE_KEY) !== null ||
      localStorage.getItem(WELCOME_SHOWN_KEY) !== null ||
      localStorage.getItem(TOUR_PROGRESS_KEY) !== null

    // Si no hay datos de onboarding, es un usuario nuevo
    return !hasAnyOnboardingData
  }

  // Función para limpiar datos residuales
  const cleanResidualData = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    localStorage.removeItem(WELCOME_SHOWN_KEY)
    localStorage.removeItem(TOUR_PROGRESS_KEY)
  }

  // NUEVO: Verificar estado del tour INMEDIATAMENTE en cada mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Si hay progreso guardado, mantener el tour abierto INMEDIATAMENTE
    const tourProgress = localStorage.getItem(TOUR_PROGRESS_KEY)
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
    
    if (tourProgress && !completed) {
      console.log('🔄 Manteniendo tour abierto en navegación...')
      setIsOnboardingOpen(true)
      setIsOnboardingCompleted(false)
      setIsWelcomeOpen(false)
    }
  }, []) // Ejecutar en cada mount (cada navegación)

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return
    }

    // Delay para asegurar que todo esté cargado
    const timer = setTimeout(() => {
      checkOnboardingStatus()
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, []) // Solo al montar

  const checkOnboardingStatus = () => {
    try {
      const completedValue = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      const welcomeShownValue = localStorage.getItem(WELCOME_SHOWN_KEY)
      const tourProgressValue = localStorage.getItem(TOUR_PROGRESS_KEY)
      
      // Convertir valores a booleanos de manera más estricta
      const completed = completedValue === 'true'
      const welcomeShown = welcomeShownValue === 'true'
      const tourProgress = tourProgressValue

      // IMPORTANTE: Si el tour ya está abierto, no hacer nada
      if (isOnboardingOpen) {
        console.log('ℹ️ Tour ya está abierto, no modificar estado')
        return
      }

      // Establecer el estado base
      setIsOnboardingCompleted(completed)

      // CASO ESPECIAL: Detectar usuario realmente nuevo
      if (completedValue === null && welcomeShownValue === null && tourProgressValue === null) {
        // Solo mostrar welcome en dashboard
        if (window.location.pathname === '/dashboard') {
          setIsWelcomeOpen(true)
        }
        return
      }

      // CASO ESPECIAL 2: Detectar datos residuales inconsistentes
      if (!completed && !welcomeShown && !tourProgress && completedValue !== null) {
        cleanResidualData()
        setIsOnboardingCompleted(false)
        // Solo mostrar welcome en dashboard
        if (window.location.pathname === '/dashboard') {
          setIsWelcomeOpen(true)
        }
        return
      }

      // CASO 1: Usuario nunca vio welcome pero tiene algún valor en localStorage
      if (!welcomeShown && !completed) {
        // Solo mostrar welcome en dashboard
        if (window.location.pathname === '/dashboard') {
          setIsWelcomeOpen(true)
        }
        return
      }

      // CASO 2: Usuario vio welcome pero no completó tour
      if (welcomeShown && !completed && !tourProgress) {
        // Solo iniciar tour en dashboard
        if (window.location.pathname === '/dashboard') {
          setIsOnboardingOpen(true)
        }
        return
      }

      // CASO 3: Usuario tiene progreso del tour guardado - CONTINUAR EN CUALQUIER PÁGINA
      if (tourProgress && !completed) {
        console.log('✅ Continuando tour en progreso...')
        setIsOnboardingOpen(true)
        return
      }

      // CASO 4: Usuario ya completó todo - no hacer nada
      console.log('ℹ️ Onboarding ya completado')

    } catch (error) {
      console.error('Error en checkOnboardingStatus:', error)
      // En caso de error, mostrar onboarding por seguridad
      setIsOnboardingCompleted(false)
      if (window.location.pathname === '/dashboard') {
        setIsWelcomeOpen(true)
      }
    }
  }

  const startOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    localStorage.setItem(TOUR_PROGRESS_KEY, '0')
    setIsOnboardingCompleted(false)
    setIsOnboardingOpen(true)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    localStorage.removeItem(TOUR_PROGRESS_KEY)
    setIsOnboardingCompleted(true)
    setIsOnboardingOpen(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    localStorage.removeItem(WELCOME_SHOWN_KEY)
    localStorage.removeItem(TOUR_PROGRESS_KEY)
    setIsOnboardingCompleted(false)
    setIsWelcomeOpen(false)
    setIsOnboardingOpen(false)
  }

  const closeWelcome = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    setIsWelcomeOpen(false)
  }

  const startTourFromWelcome = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    localStorage.setItem(TOUR_PROGRESS_KEY, '0')
    setIsWelcomeOpen(false)
    setTimeout(() => {
      setIsOnboardingOpen(true)
    }, 300)
  }

  // Log del estado actual cada vez que cambie
  useEffect(() => {
    console.log('📊 Estado actual del hook:', {
      isOnboardingOpen,
      isOnboardingCompleted,
      isWelcomeOpen
    })
  }, [isOnboardingOpen, isOnboardingCompleted, isWelcomeOpen])

  return {
    isOnboardingOpen,
    isOnboardingCompleted,
    isWelcomeOpen,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeWelcome,
    startTourFromWelcome
  }
}