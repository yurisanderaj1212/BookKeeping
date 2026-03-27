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
  useEffect(() => {
    if (typeof window === 'undefined') return
    const completed   = localStorage.getItem(KEY_COMPLETED) === 'true'
    const welcomeSeen = localStorage.getItem(KEY_WELCOME)   === 'true'
    setIsOnboardingCompleted(completed)
    // Solo mostrar welcome si nunca lo vio Y no completó el tour
    if (!welcomeSeen && !completed) {
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
