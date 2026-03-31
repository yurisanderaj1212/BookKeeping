'use client'

import { useState, useEffect } from 'react'

const KEY_COMPLETED = 'cn-onboarding-completed'
const KEY_WELCOME   = 'cn-welcome-shown'

export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isWelcomeOpen,    setIsWelcomeOpen]    = useState(false)
  const [currentStep,      setCurrentStep]      = useState(0)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true)

  // Solo al montar: mostrar WelcomeModal si es la primera vez
  // O restaurar el tour si estaba activo en otra página
  useEffect(() => {
    if (typeof window === 'undefined') return
    const completed   = localStorage.getItem(KEY_COMPLETED) === 'true'
    const welcomeSeen = localStorage.getItem(KEY_WELCOME)   === 'true'
    const savedStep   = localStorage.getItem('cn-onboarding-step')

    setIsOnboardingCompleted(completed)

    if (completed) return  // tour ya terminado, no hacer nada

    // Si hay un step guardado, el tour estaba activo — restaurarlo
    if (savedStep !== null) {
      const n = parseInt(savedStep)
      if (!isNaN(n) && n >= 0) {
        setCurrentStep(n)
        // Small delay to let the page render first
        setTimeout(() => setIsOnboardingOpen(true), 300)
        return
      }
    }

    // Primera vez: mostrar welcome si no lo ha visto
    if (!welcomeSeen) {
      setIsWelcomeOpen(true)
    }
  }, [])

  // Cerrar welcome sin iniciar tour (botón "Explorar por mi cuenta")
  const closeWelcome = () => {
    localStorage.setItem(KEY_WELCOME, 'true')
    setIsWelcomeOpen(false)
  }

  // Desde el WelcomeModal → botón "Comenzar Tour"
  const startTourFromWelcome = () => {
    localStorage.setItem(KEY_WELCOME, 'true')
    setIsWelcomeOpen(false)
    setCurrentStep(0)
    setTimeout(() => setIsOnboardingOpen(true), 300)
  }

  // Desde HelpButton o Settings → abrir tour directamente
  const resetOnboarding = () => {
    localStorage.removeItem(KEY_COMPLETED)
    localStorage.removeItem('cn-onboarding-step')
    setIsOnboardingCompleted(false)
    setCurrentStep(0)
    setIsWelcomeOpen(false)
    setTimeout(() => setIsOnboardingOpen(true), 100)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  const completeOnboarding = () => {
    localStorage.setItem(KEY_COMPLETED, 'true')
    localStorage.removeItem('cn-onboarding-step')
    setIsOnboardingCompleted(true)
    setIsOnboardingOpen(false)
  }

  // Alias para compatibilidad con el dashboard
  const startOnboarding = startTourFromWelcome

  return {
    isOnboardingOpen,
    isOnboardingCompleted,
    isWelcomeOpen,
    currentStep,
    setStep: setCurrentStep,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeWelcome,
    startTourFromWelcome,
  }
}
