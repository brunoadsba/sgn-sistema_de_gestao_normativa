'use client'

import { useState } from 'react'
import { AppOpeningScreen } from '@/components/loading/AppOpeningScreen'

const DEVICE_SPLASH_KEY = 'sgn.opening.seen.device'

export function SessionSplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(DEVICE_SPLASH_KEY) !== '1'
  })

  const handleContinue = () => {
    window.localStorage.setItem(DEVICE_SPLASH_KEY, '1')
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <AppOpeningScreen
        title="SGN"
        subtitle="Centro profissional para gestão normativa e conformidade em SST."
        actionLabel="Acessar Plataforma"
        onContinue={handleContinue}
      />
    )
  }

  return <>{children}</>
}
