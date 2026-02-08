'use client'

import { useState, useEffect } from 'react'

const ONBOARDING_STORAGE_KEY = 'chill-numbers-onboarding-completed'
const WELCOME_SHOWN_KEY = 'chill-numbers-welcome-shown'
const TOUR_PROGRESS_KEY = 'chill-numbers-tour-progress'

export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true) // Default to true to avoid flash
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY)
    const tourProgress = localStorage.getItem(TOUR_PROGRESS_KEY)
    
    const hasCompleted = completed === 'true'
    const hasShownWelcome = welcomeShown === 'true'
    const hasTourProgress = tourProgress !== null && parseInt(tourProgress) >= 0
    
    // IMPORTANT: Don't set completed to true if tour is in progress
    if (hasTourProgress && !hasCompleted) {
      setIsOnboardingCompleted(false)
    } else {
      setIsOnboardingCompleted(hasCompleted)
    }
    
    // If user is new (no welcome shown yet), show welcome modal on dashboard
    if (!hasShownWelcome && window.location.pathname === '/dashboard') {
      setTimeout(() => {
        setIsWelcomeOpen(true)
      }, 500)
    }
    // If tour is in progress (has saved progress), continue tour on ANY page
    else if (!hasCompleted && hasTourProgress) {
      setTimeout(() => {
        setIsOnboardingOpen(true)
      }, 800)
    }
    // If welcome was shown but onboarding not completed, and user is on dashboard without tour progress
    else if (!hasCompleted && hasShownWelcome && window.location.pathname === '/dashboard' && !hasTourProgress) {
      setTimeout(() => {
        setIsOnboardingOpen(true)
      }, 1000)
    }
  }, [])

  // Also listen for storage changes to detect tour progress updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOUR_PROGRESS_KEY && e.newValue !== null) {
        const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
        // Only activate if not completed and not already open
        if (completed !== 'true' && !isOnboardingOpen) {
          setIsOnboardingOpen(true)
        }
      }
      // If onboarding was marked as completed, close the tour
      if (e.key === ONBOARDING_STORAGE_KEY && e.newValue === 'true') {
        setIsOnboardingOpen(false)
        setIsOnboardingCompleted(true)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isOnboardingOpen])

  const startOnboarding = () => {
    // Reset any existing progress and start from beginning
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
    localStorage.setItem(TOUR_PROGRESS_KEY, '0') // Start from step 0
    setIsWelcomeOpen(false)
    setTimeout(() => {
      setIsOnboardingOpen(true)
    }, 300)
  }

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